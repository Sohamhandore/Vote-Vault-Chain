// Mock Web3 Service to simulate blockchain interactions
// In a real implementation, this would connect to actual Ethereum network

export interface Election {
  id: string;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  isActive: boolean;
  candidates: Candidate[];
  totalVotes: number;
  hasVoted?: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  description: string;
  voteCount: number;
  imageUrl?: string;
}

export interface Vote {
  electionId: string;
  candidateId: string;
  voterAddress: string;
  timestamp: number;
  txHash: string;
}

export interface Voter {
  address: string;
  isRegistered: boolean;
  hasVoted: { [electionId: string]: boolean };
}

// Mock blockchain state
class MockBlockchain {
  private elections: Map<string, Election> = new Map();
  private votes: Map<string, Vote[]> = new Map();
  private voters: Map<string, Voter> = new Map();
  private currentAccount: string | null = null;
  private isAdmin: boolean = false;

  constructor() {
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample election
    const sampleElection: Election = {
      id: "election-1",
      title: "2024 Student Council Elections",
      description: "Vote for your preferred student council president",
      startTime: Date.now() - 3600000, // Started 1 hour ago
      endTime: Date.now() + 86400000, // Ends in 24 hours
      isActive: true,
      totalVotes: 0,
      candidates: [
        {
          id: "candidate-1",
          name: "Alice Johnson",
          description: "Experienced leader with vision for positive change",
          voteCount: 0
        },
        {
          id: "candidate-2", 
          name: "Bob Smith",
          description: "Fresh perspective and innovative ideas",
          voteCount: 0
        },
        {
          id: "candidate-3",
          name: "Carol Davis",
          description: "Proven track record in student advocacy",
          voteCount: 0
        }
      ]
    };

    this.elections.set(sampleElection.id, sampleElection);
    this.votes.set(sampleElection.id, []);
  }

  // Wallet connection simulation
  async connectWallet(): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockAddress = "0x" + Math.random().toString(16).substr(2, 40);
        this.currentAccount = mockAddress;
        this.isAdmin = Math.random() > 0.5; // 50% chance to be admin
        
        // Register voter if not exists
        if (!this.voters.has(mockAddress)) {
          this.voters.set(mockAddress, {
            address: mockAddress,
            isRegistered: true,
            hasVoted: {}
          });
        }
        
        resolve(mockAddress);
      }, 1500);
    });
  }

  async disconnectWallet(): Promise<void> {
    this.currentAccount = null;
    this.isAdmin = false;
  }

  getCurrentAccount(): string | null {
    return this.currentAccount;
  }

  getIsAdmin(): boolean {
    return this.isAdmin;
  }

  // Election management
  async createElection(election: Omit<Election, 'id' | 'candidates' | 'totalVotes' | 'isActive'>): Promise<string> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!this.isAdmin) {
          reject(new Error("Only admin can create elections"));
          return;
        }

        const electionId = "election-" + Date.now();
        const newElection: Election = {
          ...election,
          id: electionId,
          candidates: [],
          totalVotes: 0,
          isActive: Date.now() >= election.startTime && Date.now() <= election.endTime
        };

        this.elections.set(electionId, newElection);
        this.votes.set(electionId, []);
        resolve(electionId);
      }, 1000);
    });
  }

  async addCandidate(electionId: string, candidate: Omit<Candidate, 'id' | 'voteCount'>): Promise<string> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!this.isAdmin) {
          reject(new Error("Only admin can add candidates"));
          return;
        }

        const election = this.elections.get(electionId);
        if (!election) {
          reject(new Error("Election not found"));
          return;
        }

        const candidateId = "candidate-" + Date.now();
        const newCandidate: Candidate = {
          ...candidate,
          id: candidateId,
          voteCount: 0
        };

        election.candidates.push(newCandidate);
        this.elections.set(electionId, election);
        resolve(candidateId);
      }, 800);
    });
  }

  async getAllElections(): Promise<Election[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const elections = Array.from(this.elections.values()).map(election => ({
          ...election,
          hasVoted: this.currentAccount ? this.hasVoted(election.id, this.currentAccount) : false
        }));
        resolve(elections);
      }, 500);
    });
  }

  async getElection(electionId: string): Promise<Election | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const election = this.elections.get(electionId);
        if (election) {
          resolve({
            ...election,
            hasVoted: this.currentAccount ? this.hasVoted(electionId, this.currentAccount) : false
          });
        } else {
          resolve(null);
        }
      }, 300);
    });
  }

  // Voting
  async castVote(electionId: string, candidateId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!this.currentAccount) {
          reject(new Error("Wallet not connected"));
          return;
        }

        const election = this.elections.get(electionId);
        if (!election) {
          reject(new Error("Election not found"));
          return;
        }

        if (!election.isActive) {
          reject(new Error("Election is not active"));
          return;
        }

        if (this.hasVoted(electionId, this.currentAccount)) {
          reject(new Error("You have already voted in this election"));
          return;
        }

        const candidate = election.candidates.find(c => c.id === candidateId);
        if (!candidate) {
          reject(new Error("Candidate not found"));
          return;
        }

        // Create vote record
        const txHash = "0x" + Math.random().toString(16).substr(2, 64);
        const vote: Vote = {
          electionId,
          candidateId,
          voterAddress: this.currentAccount,
          timestamp: Date.now(),
          txHash
        };

        // Update vote counts
        candidate.voteCount++;
        election.totalVotes++;
        
        // Record the vote
        const electionVotes = this.votes.get(electionId) || [];
        electionVotes.push(vote);
        this.votes.set(electionId, electionVotes);

        // Update voter record
        const voter = this.voters.get(this.currentAccount);
        if (voter) {
          voter.hasVoted[electionId] = true;
          this.voters.set(this.currentAccount, voter);
        }

        // Update election
        this.elections.set(electionId, election);

        resolve(txHash);
      }, 2000); // Simulate blockchain transaction time
    });
  }

  private hasVoted(electionId: string, voterAddress: string): boolean {
    const voter = this.voters.get(voterAddress);
    return voter?.hasVoted[electionId] || false;
  }

  async getElectionResults(electionId: string): Promise<Candidate[]> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const election = this.elections.get(electionId);
        if (!election) {
          reject(new Error("Election not found"));
          return;
        }

        resolve([...election.candidates].sort((a, b) => b.voteCount - a.voteCount));
      }, 300);
    });
  }

  // Utility methods
  async getTransactionStatus(txHash: string): Promise<'pending' | 'confirmed' | 'failed'> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate random transaction outcomes
        const outcomes: ('pending' | 'confirmed' | 'failed')[] = ['confirmed', 'confirmed', 'confirmed', 'pending', 'failed'];
        resolve(outcomes[Math.floor(Math.random() * outcomes.length)]);
      }, 1000);
    });
  }

  async getGasEstimate(operation: string): Promise<number> {
    const gasEstimates: { [key: string]: number } = {
      'createElection': 200000,
      'addCandidate': 100000,
      'castVote': 80000,
      'getResults': 50000
    };
    
    return gasEstimates[operation] || 100000;
  }
}

// Export singleton instance
export const web3Service = new MockBlockchain();

// Solidity Contract Documentation
export const VOTING_CONTRACT_SOLIDITY = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title VotingSystem
 * @dev Secure blockchain-based voting system with admin controls
 * @author Blockchain Developer
 */
contract VotingSystem {
    
    // State variables
    address public admin;
    uint256 public electionCounter;
    
    struct Candidate {
        uint256 id;
        string name;
        string description;
        uint256 voteCount;
        bool exists;
    }
    
    struct Election {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        uint256 candidateCounter;
        uint256 totalVotes;
        mapping(uint256 => Candidate) candidates;
        mapping(address => bool) hasVoted;
    }
    
    // Mappings
    mapping(uint256 => Election) public elections;
    mapping(address => bool) public registeredVoters;
    
    // Events
    event ElectionCreated(uint256 indexed electionId, string title);
    event CandidateAdded(uint256 indexed electionId, uint256 candidateId, string name);
    event VoteCast(uint256 indexed electionId, uint256 candidateId, address voter);
    event VoterRegistered(address voter);
    
    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlyRegisteredVoter() {
        require(registeredVoters[msg.sender], "Voter not registered");
        _;
    }
    
    modifier electionExists(uint256 _electionId) {
        require(_electionId <= electionCounter && _electionId > 0, "Election does not exist");
        _;
    }
    
    modifier electionActive(uint256 _electionId) {
        Election storage election = elections[_electionId];
        require(
            block.timestamp >= election.startTime && 
            block.timestamp <= election.endTime && 
            election.isActive,
            "Election is not active"
        );
        _;
    }
    
    // Constructor
    constructor() {
        admin = msg.sender;
        electionCounter = 0;
    }
    
    /**
     * @dev Register a new voter
     */
    function registerVoter() external {
        require(!registeredVoters[msg.sender], "Voter already registered");
        registeredVoters[msg.sender] = true;
        emit VoterRegistered(msg.sender);
    }
    
    /**
     * @dev Create a new election (admin only)
     * @param _title Election title
     * @param _description Election description
     * @param _startTime Election start timestamp
     * @param _endTime Election end timestamp
     */
    function createElection(
        string memory _title,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyAdmin returns (uint256) {
        require(_startTime < _endTime, "Invalid time range");
        require(_endTime > block.timestamp, "End time must be in future");
        
        electionCounter++;
        Election storage newElection = elections[electionCounter];
        newElection.id = electionCounter;
        newElection.title = _title;
        newElection.description = _description;
        newElection.startTime = _startTime;
        newElection.endTime = _endTime;
        newElection.isActive = true;
        newElection.candidateCounter = 0;
        newElection.totalVotes = 0;
        
        emit ElectionCreated(electionCounter, _title);
        return electionCounter;
    }
    
    /**
     * @dev Add a candidate to an election (admin only)
     * @param _electionId Election ID
     * @param _name Candidate name
     * @param _description Candidate description
     */
    function addCandidate(
        uint256 _electionId,
        string memory _name,
        string memory _description
    ) external onlyAdmin electionExists(_electionId) returns (uint256) {
        Election storage election = elections[_electionId];
        require(block.timestamp < election.startTime, "Cannot add candidates after election starts");
        
        election.candidateCounter++;
        uint256 candidateId = election.candidateCounter;
        
        election.candidates[candidateId] = Candidate({
            id: candidateId,
            name: _name,
            description: _description,
            voteCount: 0,
            exists: true
        });
        
        emit CandidateAdded(_electionId, candidateId, _name);
        return candidateId;
    }
    
    /**
     * @dev Cast a vote in an election
     * @param _electionId Election ID
     * @param _candidateId Candidate ID
     */
    function castVote(uint256 _electionId, uint256 _candidateId) 
        external 
        onlyRegisteredVoter 
        electionExists(_electionId) 
        electionActive(_electionId) 
    {
        Election storage election = elections[_electionId];
        require(!election.hasVoted[msg.sender], "Voter has already voted");
        require(
            _candidateId <= election.candidateCounter && _candidateId > 0,
            "Candidate does not exist"
        );
        require(election.candidates[_candidateId].exists, "Candidate does not exist");
        
        // Record the vote
        election.hasVoted[msg.sender] = true;
        election.candidates[_candidateId].voteCount++;
        election.totalVotes++;
        
        emit VoteCast(_electionId, _candidateId, msg.sender);
    }
    
    /**
     * @dev Get election results
     * @param _electionId Election ID
     * @return Arrays of candidate data
     */
    function getElectionResults(uint256 _electionId) 
        external 
        view 
        electionExists(_electionId) 
        returns (
            uint256[] memory candidateIds,
            string[] memory names,
            string[] memory descriptions,
            uint256[] memory voteCounts
        ) 
    {
        Election storage election = elections[_electionId];
        uint256 candidateCount = election.candidateCounter;
        
        candidateIds = new uint256[](candidateCount);
        names = new string[](candidateCount);
        descriptions = new string[](candidateCount);
        voteCounts = new uint256[](candidateCount);
        
        for (uint256 i = 1; i <= candidateCount; i++) {
            if (election.candidates[i].exists) {
                candidateIds[i-1] = election.candidates[i].id;
                names[i-1] = election.candidates[i].name;
                descriptions[i-1] = election.candidates[i].description;
                voteCounts[i-1] = election.candidates[i].voteCount;
            }
        }
    }
    
    /**
     * @dev Check if a voter has voted in an election
     * @param _electionId Election ID
     * @param _voter Voter address
     * @return Boolean indicating if voter has voted
     */
    function hasVotedInElection(uint256 _electionId, address _voter) 
        external 
        view 
        electionExists(_electionId) 
        returns (bool) 
    {
        return elections[_electionId].hasVoted[_voter];
    }
    
    /**
     * @dev Get election details
     * @param _electionId Election ID
     * @return Election details
     */
    function getElectionDetails(uint256 _electionId) 
        external 
        view 
        electionExists(_electionId) 
        returns (
            uint256 id,
            string memory title,
            string memory description,
            uint256 startTime,
            uint256 endTime,
            bool isActive,
            uint256 totalVotes
        ) 
    {
        Election storage election = elections[_electionId];
        return (
            election.id,
            election.title,
            election.description,
            election.startTime,
            election.endTime,
            election.isActive,
            election.totalVotes
        );
    }
    
    /**
     * @dev Emergency stop an election (admin only)
     * @param _electionId Election ID
     */
    function stopElection(uint256 _electionId) 
        external 
        onlyAdmin 
        electionExists(_electionId) 
    {
        elections[_electionId].isActive = false;
    }
    
    /**
     * @dev Get total number of elections
     * @return Total election count
     */
    function getTotalElections() external view returns (uint256) {
        return electionCounter;
    }
}
`;