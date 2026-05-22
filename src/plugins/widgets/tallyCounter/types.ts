export interface Data {
  count: number;
  label: string;
  step: number;
  showReset: boolean;
}

export const defaultData: Data = {
  count: 0,
  label: "Tally Counter",
  step: 1,
  showReset: true,
};
