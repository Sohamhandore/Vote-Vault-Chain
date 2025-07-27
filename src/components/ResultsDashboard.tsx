import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BarChart, Users, Trophy, TrendingUp, RefreshCw, Calendar } from 'lucide-react';
import { web3Service, Election, Candidate } from '@/services/web3Service';
import { useToast } from '@/hooks/use-toast';

interface ResultsDashboardProps {
  isVisible: boolean;
}

export const ResultsDashboard = ({ isVisible }: ResultsDashboardProps) => {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [results, setResults] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isVisible) {
      loadElections();
    }
  }, [isVisible]);

  const loadElections = async () => {
    try {
      setIsLoading(true);
      const electionList = await web3Service.getAllElections();
      setElections(electionList);
      
      // Auto-select most recent election with votes
      const electionWithVotes = electionList.find(e => e.totalVotes > 0) || electionList[0];
      if (electionWithVotes) {
        setSelectedElection(electionWithVotes);
        await loadResults(electionWithVotes.id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load elections",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadResults = async (electionId: string) => {
    try {
      const electionResults = await web3Service.getElectionResults(electionId);
      setResults(electionResults);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load results",
        variant: "destructive",
      });
    }
  };

  const handleElectionSelect = async (election: Election) => {
    setSelectedElection(election);
    await loadResults(election.id);
  };

  const getElectionStatus = (election: Election) => {
    const now = Date.now();
    if (now < election.startTime) {
      return { status: 'upcoming', text: 'Upcoming', color: 'secondary' };
    } else if (now > election.endTime) {
      return { status: 'ended', text: 'Ended', color: 'destructive' };
    } else {
      return { status: 'active', text: 'Live Results', color: 'default' };
    }
  };

  const getVotePercentage = (candidate: Candidate, totalVotes: number) => {
    return totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;
  };

  const formatElectionTime = (startTime: number, endTime: number) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <BarChart className="w-5 h-5" />
          <span>Election Results</span>
        </h3>
        <Button
          variant="results"
          size="sm"
          onClick={loadElections}
          disabled={isLoading}
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* Election Selection */}
      {elections.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Select Election</CardTitle>
            <CardDescription>Choose an election to view detailed results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {elections.map((election) => {
                const status = getElectionStatus(election);
                return (
                  <div
                    key={election.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedElection?.id === election.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                    onClick={() => handleElectionSelect(election)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-foreground text-sm">{election.title}</h4>
                      <Badge variant={status.color as any} className="text-xs">
                        {status.text}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{election.totalVotes}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatElectionTime(election.startTime, election.endTime)}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {selectedElection ? (
        <div className="space-y-6">
          {/* Election Overview */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{selectedElection.title}</span>
                    {getElectionStatus(selectedElection).status === 'active' && (
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">{selectedElection.description}</CardDescription>
                </div>
                <Badge variant={getElectionStatus(selectedElection).color as any}>
                  {getElectionStatus(selectedElection).text}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{selectedElection.totalVotes}</div>
                  <div className="text-sm text-muted-foreground">Total Votes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{selectedElection.candidates.length}</div>
                  <div className="text-sm text-muted-foreground">Candidates</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {new Date(selectedElection.startTime).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Start Date</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {new Date(selectedElection.endTime).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-muted-foreground">End Date</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Candidate Results */}
          {results.length > 0 ? (
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-accent" />
                  <span>Candidate Results</span>
                </CardTitle>
                <CardDescription>
                  {selectedElection.totalVotes > 0 
                    ? "Results are updated in real-time as votes are cast"
                    : "No votes have been cast yet"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {results.map((candidate, index) => {
                  const percentage = getVotePercentage(candidate, selectedElection.totalVotes);
                  const isWinner = index === 0 && selectedElection.totalVotes > 0;
                  
                  return (
                    <div key={candidate.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            isWinner 
                              ? 'bg-accent text-accent-foreground' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground flex items-center space-x-2">
                              <span>{candidate.name}</span>
                              {isWinner && selectedElection.totalVotes > 0 && (
                                <Trophy className="w-4 h-4 text-accent" />
                              )}
                            </h4>
                            <p className="text-sm text-muted-foreground">{candidate.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-foreground">{candidate.voteCount} votes</div>
                          <div className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                      
                      <Progress 
                        value={percentage} 
                        className={`h-3 ${isWinner ? 'bg-accent/20' : ''}`}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-8 text-center">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No results available yet. Results will appear once voting begins.</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-8 text-center">
            <BarChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {elections.length === 0 
                ? "No elections available to display results." 
                : "Select an election above to view results."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};