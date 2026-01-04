
/**
 * Defines a generic authenticated session
 * this shouldn't be used on its own and should be extended with other interfaces as needed
 */
export type Session = {
  name: string; // key to identify session token in local storage
  expires: number;
}