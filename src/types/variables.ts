export type Variable = {
  name: string;
  formattedName?: string;
  value: string;
  property: string;
  selector: {
    text: string;
    index: number;
  };
};
