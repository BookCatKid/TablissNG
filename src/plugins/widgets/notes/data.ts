interface Note {
  contents: string;
}

export interface Data {
  notes: Note[];
  markdownEnabled: boolean;
  textAlign: "left" | "center" | "right";
  iconAlign: "left" | "center" | "right";
  placeholderStyle: "icon" | "text";
  keyBind?: string;
  richTextEnabled?: boolean;
}

export const defaultData: Data = {
  notes: [{ contents: "" }],
  markdownEnabled: true,
  textAlign: "left",
  iconAlign: "center",
  placeholderStyle: "icon",
  keyBind: "N",
  richTextEnabled: false,
};
