export type ActiveGameView = 'MAIN_COCKPIT' | 'CHALLENGES' | 'CLAN_TREE' | 'CHUNIN_EXAM' | 'RANKINGS' | 'MISSIONS' | 'INVENTORY';

export interface ViewNavigationState {
  currentView: ActiveGameView;
  setView: (view: ActiveGameView) => void;
}
