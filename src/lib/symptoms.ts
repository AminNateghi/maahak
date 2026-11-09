import fa from "@/i18n/fa.json";

export const symptomGroups = fa.symptoms.groups;

export type SymptomGroup = keyof typeof symptomGroups;
export type SymptomName = string;
export const healthConditions = fa.healthConditions;
