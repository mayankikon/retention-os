export interface MessageVariable {
  token: string;
  label: string;
  description: string;
  example: string;
}

export const MESSAGE_VARIABLES: MessageVariable[] = [
  {
    token: "[@FN@]",
    label: "First Name",
    description: "Customer's first name from the campaign audience record.",
    example: "John",
  },
  {
    token: "[@YEA@]",
    label: "Vehicle Year",
    description: "Model year of the customer's vehicle on file.",
    example: "2019",
  },
  {
    token: "[@MAK@]",
    label: "Vehicle Make",
    description: "Manufacturer of the customer's vehicle (e.g., Ford, Toyota).",
    example: "Honda",
  },
  {
    token: "[@MOD@]",
    label: "Vehicle Model",
    description: "Model name of the customer's vehicle.",
    example: "Accord",
  },
  {
    token: "[@DSP@]",
    label: "Dealer Scheduling Page",
    description:
      "Link to the dealership service scheduler (populated from Planet X Service Appointment URL).",
    example: "https://dealer.example.com/schedule",
  },
  {
    token: "(Dealer DID)",
    label: "Dealer Phone (DID)",
    description:
      "Dealership phone number to include in the message. Use the DID configured for this rooftop.",
    example: "(555) 123-4567",
  },
];
