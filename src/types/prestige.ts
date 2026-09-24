export type ClanBranchKey = 'root' | 'senju' | 'uchiha' | 'hyuga' | 'otsutsuki';

export interface ClanNode {
  readonly id: string;
  readonly name: string;
  readonly branch: ClanBranchKey;
  readonly icon: string;
  readonly cost: number;
  readonly desc: string;
  readonly parent: string | null;
}

export interface ClanBranch {
  readonly key: ClanBranchKey;
  readonly name: string;
  readonly nodes: readonly string[];
}
