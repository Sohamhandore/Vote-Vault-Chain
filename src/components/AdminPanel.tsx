import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Calendar, Users, Vote, Trash2 } from 'lucide-react';
import { web3Service, Election } from '@/services/web3Service';
import { useToast } from '@/hooks/use-toast';

interface AdminPanelProps {
  isVisible: boolean;
}

export const AdminPanel = ({ isVisible }: AdminPanelProps) => {
  const [elections, setElections] = useState<Election[]>([]);
  const [isCreatingElection, setIsCreatingElection] = useState(false);
  const [isAddingCandidate, setIsAddingCandidate] = useState<string | null>(null);
  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: ''
  });
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    description: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isVisible) {
      loadElections();
    }
  }, [isVisible]);

  const loadElections = async () => {
    try {
      const electionList = await web3Service.getAllElections();
      setElections(electionList);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load elections",
        variant: "destructive",
      });
    }
  };

  const createElection = async () => {
    try {
      setIsCreatingElection(true);
      
      const startTime = new Date(newElection.startTime).getTime();
      const endTime = new Date(newElection.endTime).getTime();
      
      if (startTime >= endTime) {
        toast({
          title: "Invalid Time Range",
          description: "End time must be after start time",
          variant: "destructive",
        });
        return;
      }

      await web3Service.createElection({
        title: newElection.title,
        description: newElection.description,
        startTime,
        endTime
      });

      setNewElection({ title: '', description: '', startTime: '', endTime: '' });
      await loadElections();

      toast({
        title: "Election Created",
        description: `${newElection.title} has been created successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to create election",
        variant: "destructive",
      });
    } finally {
      setIsCreatingElection(false);
    }
  };

  const addCandidate = async (electionId: string) => {
    try {
      setIsAddingCandidate(electionId);
      
      await web3Service.addCandidate(electionId, {
        name: newCandidate.name,
        description: newCandidate.description
      });

      setNewCandidate({ name: '', description: '' });
      setIsAddingCandidate(null);
      await loadElections();

      toast({
        title: "Candidate Added",
        description: `${newCandidate.name} has been added as a candidate`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to add candidate",
        variant: "destructive",
      });
    } finally {
      setIsAddingCandidate(null);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-6">
      {/* Create Election Form */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Vote className="w-5 h-5 text-primary" />
            <span>Create New Election</span>
          </CardTitle>
          <CardDescription>
            Set up a new voting election with candidates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Election Title</Label>
              <Input
                id="title"
                placeholder="e.g., Student Council Elections 2024"
                value={newElection.title}
                onChange={(e) => setNewElection(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the election"
                value={newElection.description}
                onChange={(e) => setNewElection(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={newElection.startTime}
                onChange={(e) => setNewElection(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={newElection.endTime}
                onChange={(e) => setNewElection(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>

          <Button 
            variant="admin"
            onClick={createElection}
            disabled={!newElection.title || !newElection.startTime || !newElection.endTime || isCreatingElection}
            className="w-full"
          >
            {isCreatingElection ? (
              <>
                <div className="w-4 h-4 border-2 border-success-foreground border-t-transparent rounded-full animate-spin" />
                Creating Election...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Election
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Elections List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>Manage Elections</span>
        </h3>
        
        {elections.length === 0 ? (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-8 text-center">
              <Vote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No elections created yet. Create your first election above.</p>
            </CardContent>
          </Card>
        ) : (
          elections.map((election) => (
            <Card key={election.id} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{election.title}</CardTitle>
                    <CardDescription className="mt-1">{election.description}</CardDescription>
                  </div>
                  <Badge variant={election.isActive ? "default" : "secondary"}>
                    {election.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>Start: {new Date(election.startTime).toLocaleString()}</span>
                  <span>End: {new Date(election.endTime).toLocaleString()}</span>
                  <span className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{election.totalVotes} votes</span>
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Candidates */}
                <div>
                  <h4 className="font-medium text-foreground mb-2">Candidates ({election.candidates.length})</h4>
                  {election.candidates.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No candidates added yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {election.candidates.map((candidate) => (
                        <div key={candidate.id} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-foreground">{candidate.name}</h5>
                              <p className="text-xs text-muted-foreground">{candidate.description}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {candidate.voteCount} votes
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Add Candidate Form */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Add Candidate</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      placeholder="Candidate name"
                      value={newCandidate.name}
                      onChange={(e) => setNewCandidate(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      placeholder="Brief description"
                      value={newCandidate.description}
                      onChange={(e) => setNewCandidate(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => addCandidate(election.id)}
                    disabled={!newCandidate.name || isAddingCandidate === election.id}
                  >
                    {isAddingCandidate === election.id ? (
                      <>
                        <div className="w-3 h-3 border-2 border-secondary-foreground border-t-transparent rounded-full animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        Add Candidate
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};