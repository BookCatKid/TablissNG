declare module "*/messages.json" {
  const value: Record<
    string,
    {
      defaultMessage: string;
      description?: string;
    }
  >;
  export default value;
}
