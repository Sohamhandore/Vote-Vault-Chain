import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Vote, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { web3Service, Election, Candidate } from '@/services/web3Service';
import { useToast } from '@/hooks/use-toast';

interface VotingPanelProps {
  isVisible: boolean;
  account: string | null;
}

export const VotingPanel = ({ isVisible, account }: VotingPanelProps) => {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [votingStatus, setVotingStatus] = useState<'idle' | 'pending' | 'confirmed' | 'failed'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    if (isVisible && account) {
      loadElections();
    }
  }, [isVisible, account]);

  const loadElections = async () => {
    try {
      const electionList = await web3Service.getAllElections();
      setElections(electionList);
      
      // Auto-select first active election
      const activeElection = electionList.find(e => e.isActive);
      if (activeElection) {
        setSelectedElection(activeElection);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load elections",
        variant: "destructive",
      });
    }
  };

  const castVote = async () => {
    if (!selectedElection || !selectedCandidate) return;
    
    try {
      setIsVoting(true);
      setVotingStatus('pending');
      
      const txHash = await web3Service.castVote(selectedElection.id, selectedCandidate);
      setVotingStatus('confirmed');
      
      toast({
        title: "Vote Cast Successfully!",
        description: `Your vote has been recorded on the blockchain. TX: ${txHash.slice(0, 10)}...`,
      });

      // Refresh election data
      await loadElections();
      setSelectedCandidate(null);
      
    } catch (error) {
      setVotingStatus('failed');
      toast({
        title: "Voting Failed",
        description: (error as Error).message || "Failed to cast vote",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
      setTimeout(() => setVotingStatus('idle'), 3000);
    }
  };

  const getTimeStatus = (election: Election) => {
    const now = Date.now();
    if (now < election.startTime) {
      return { status: 'upcoming', text: 'Upcoming' };
    } else if (now > election.endTime) {
      return { status: 'ended', text: 'Ended' };
    } else {
      return { status: 'active', text: 'Active' };
    }
  };

  const formatTimeRemaining = (endTime: number) => {
    const remaining = endTime - Date.now();
    if (remaining <= 0) return 'Ended';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    }
    return `${hours}h ${minutes}m remaining`;
  };

  const getVotePercentage = (candidate: Candidate, totalVotes: number) => {
    return totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;
  };

  if (!isVisible || !account) return null;

  return (
    <div className="space-y-6">
      {/* Election Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Vote className="w-5 h-5" />
          <span>Available Elections</span>
        </h3>
        
        {elections.length === 0 ? (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-8 text-center">
              <Vote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No elections available at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {elections.map((election) => {
              const timeStatus = getTimeStatus(election);
              return (
                <Card 
                  key={election.id} 
                  className={`cursor-pointer transition-all duration-200 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 ${
                    selectedElection?.id === election.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedElection(election)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{election.title}</CardTitle>
                        <CardDescription className="text-sm">{election.description}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge 
                          variant={timeStatus.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {timeStatus.text}
                        </Badge>
                        {election.hasVoted && (
                          <Badge variant="outline" className="text-xs text-success">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Voted
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{election.totalVotes} votes</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTimeRemaining(election.endTime)}</span>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Voting Interface */}
      {selectedElection && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Cast Your Vote: {selectedElection.title}</span>
              {getTimeStatus(selectedElection).status === 'active' && !selectedElection.hasVoted && (
                <Badge variant="default" className="animate-pulse">
                  <Vote className="w-3 h-3 mr-1" />
                  Voting Open
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {selectedElection.hasVoted 
                ? "You have already voted in this election. You can view the current results below."
                : getTimeStatus(selectedElection).status === 'active'
                ? "Select a candidate below to cast your vote. This action cannot be undone."
                : "This election is not currently active for voting."
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {selectedElection.candidates.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No candidates available for this election.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedElection.candidates.map((candidate) => {
                  const percentage = getVotePercentage(candidate, selectedElection.totalVotes);
                  const isSelected = selectedCandidate === candidate.id;
                  
                  return (
                    <div
                      key={candidate.id}
                      className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      } ${
                        selectedElection.hasVoted || getTimeStatus(selectedElection).status !== 'active'
                          ? 'cursor-default' 
                          : ''
                      }`}
                      onClick={() => {
                        if (!selectedElection.hasVoted && getTimeStatus(selectedElection).status === 'active') {
                          setSelectedCandidate(isSelected ? null : candidate.id);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-foreground">{candidate.name}</h4>
                          <p className="text-sm text-muted-foreground">{candidate.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-foreground">{candidate.voteCount} votes</div>
                          <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                      
                      {selectedElection.totalVotes > 0 && (
                        <Progress value={percentage} className="h-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Voting Actions */}
            {!selectedElection.hasVoted && getTimeStatus(selectedElection).status === 'active' && (
              <div className="pt-4 border-t border-border">
                <Button
                  variant="vote"
                  size="lg"
                  onClick={castVote}
                  disabled={!selectedCandidate || isVoting}
                  className="w-full"
                >
                  {isVoting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                      {votingStatus === 'pending' ? 'Broadcasting Vote...' : 'Confirming...'}
                    </>
                  ) : (
                    <>
                      <Vote className="w-4 h-4" />
                      Cast Vote
                    </>
                  )}
                </Button>
                
                {votingStatus === 'confirmed' && (
                  <div className="mt-2 text-center text-sm text-success flex items-center justify-center space-x-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Vote confirmed on blockchain!</span>
                  </div>
                )}
                
                {votingStatus === 'failed' && (
                  <div className="mt-2 text-center text-sm text-destructive flex items-center justify-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>Vote failed. Please try again.</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};