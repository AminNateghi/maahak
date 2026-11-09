import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { View } from "react-native";
import { z } from "zod";
import { saveProfile } from "@/db/repository";
import fa from "@/i18n/fa.json";
import { addDays, toIsoDate } from "@/lib/dates";
import { healthConditions } from "@/lib/symptoms";
import {
  Button,
  Card,
  ChoiceGroup,
  DateField,
  Field,
  Heading,
  Notice,
  Page,
  Text,
  Toast,
} from "@/ui";
import { Colors, Styles } from "@/ui/theme";

const regularityOptions = ["regular", "irregular", "unknown"] as const;
const premenstrualOptions = fa.onboarding.premenstrualOptions as [
  string,
  ...string[],
];
const pregnancyOptions = fa.onboarding.pregnancyOptions as [
  string,
  ...string[],
];

const schema = z.object({
  name: z.string().trim().min(1, fa.onboarding.validation.nameRequired),
  age: z
    .string()
    .regex(/^\d+$/, fa.onboarding.validation.ageNumber)
    .transform(Number)
    .pipe(
      z
        .number()
        .int()
        .min(10, { error: fa.onboarding.validation.ageRange })
        .max(100, { error: fa.onboarding.validation.ageRange }),
    ),
  heightCm: z
    .string()
    .regex(/^\d+(\.\d+)?$/, fa.onboarding.validation.heightNumber)
    .transform(Number)
    .pipe(
      z
        .number()
        .min(70, { error: fa.onboarding.validation.heightRange })
        .max(250, { error: fa.onboarding.validation.heightRange }),
    ),
  weightKg: z
    .string()
    .regex(/^\d+(\.\d+)?$/, fa.onboarding.validation.weightNumber)
    .transform(Number)
    .pipe(z.number().min(20).max(300)),
  lastPeriodStart: z.string().min(10),
  averageCycleDays: z
    .string()
    .regex(/^\d+$/, fa.onboarding.validation.cycleInterval)
    .transform(Number)
    .pipe(z.number().int().min(18).max(45)),
  periodDurationDays: z
    .string()
    .regex(/^\d+$/, fa.onboarding.validation.periodDuration)
    .transform(Number)
    .pipe(z.number().int().min(1).max(10)),
  regularity: z.enum(regularityOptions),
  premenstrualExperience: z.enum(premenstrualOptions),
  pregnancyIntent: z.enum(pregnancyOptions),
  healthConditions: z
    .array(z.string())
    .min(1, fa.onboarding.validation.conditionRequired),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export default function OnboardingScreen() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      age: "",
      heightCm: "",
      weightKg: "",
      lastPeriodStart: addDays(toIsoDate(), -14),
      averageCycleDays: "28",
      periodDurationDays: "5",
      regularity: "unknown",
      premenstrualExperience: premenstrualOptions[1],
      pregnancyIntent: pregnancyOptions[2],
      healthConditions: [fa.healthConditions[6]],
    },
  });

  const submit: SubmitHandler<FormOutput> = async (value) => {
    setSaving(true);
    try {
      const createdAt = new Date().toISOString();
      await saveProfile({
        ...value,
        initialWeightKg: value.weightKg,
        healthConditions: JSON.stringify(value.healthConditions),
        createdAt,
      });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await queryClient.invalidateQueries({ queryKey: ["period-starts"] });
      await queryClient.invalidateQueries({ queryKey: ["weight-entries"] });
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Could not save onboarding data", error);
      Toast({ text: fa.onboarding.saveFailedMessage });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page>
      <Heading title={fa.onboarding.welcome} style={{ marginTop: 20 }} />
      <Notice tone="information">{fa.onboarding.subtitle}</Notice>
      <Notice>{fa.onboarding.privacy}</Notice>
      <Card>
        <Text style={Styles.sectionTitle}>{fa.onboarding.aboutYou}</Text>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Field
              label={fa.onboarding.name}
              value={field.value}
              onChangeText={field.onChange}
              error={errors.name?.message}
            />
          )}
        />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="age"
              render={({ field }) => (
                <Field
                  label={fa.onboarding.age}
                  keyboardType="number-pad"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.age?.message}
                />
              )}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="heightCm"
              render={({ field }) => (
                <Field
                  label={fa.onboarding.height}
                  keyboardType="decimal-pad"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.heightCm?.message}
                />
              )}
            />
          </View>
        </View>
        <Controller
          control={control}
          name="weightKg"
          render={({ field }) => (
            <Field
              label={fa.onboarding.currentWeight}
              keyboardType="decimal-pad"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.weightKg?.message}
            />
          )}
        />
      </Card>
      <Card>
        <Text style={Styles.sectionTitle}>{fa.onboarding.cycle}</Text>
        <Controller
          control={control}
          name="lastPeriodStart"
          render={({ field }) => (
            <DateField
              label={fa.onboarding.lastPeriodStart}
              value={field.value}
              onChange={field.onChange}
              maximumDate={new Date()}
            />
          )}
        />
        <Controller
          control={control}
          name="averageCycleDays"
          render={({ field }) => (
            <Field
              label={fa.onboarding.averageCycle}
              keyboardType="number-pad"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.averageCycleDays?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="periodDurationDays"
          render={({ field }) => (
            <Field
              label={fa.onboarding.periodDuration}
              keyboardType="number-pad"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.periodDurationDays?.message}
            />
          )}
        />
      </Card>
      <Card>
        <Controller
          control={control}
          name="regularity"
          render={({ field }) => (
            <ChoiceGroup
              label={fa.onboarding.regularityQuestion}
              options={regularityOptions}
              value={field.value}
              onChange={field.onChange}
              getLabel={(value) => fa.onboarding.regularity[value]}
            />
          )}
        />
      </Card>
      <Card>
        <Controller
          control={control}
          name="premenstrualExperience"
          render={({ field }) => (
            <ChoiceGroup
              label={fa.onboarding.premenstrualQuestion}
              options={premenstrualOptions}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Card>
      <Card>
        <Controller
          control={control}
          name="pregnancyIntent"
          render={({ field }) => (
            <ChoiceGroup
              label={fa.onboarding.pregnancyQuestion}
              options={pregnancyOptions}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Card>
      <Card>
        <Controller
          control={control}
          name="healthConditions"
          render={({ field }) => (
            <ChoiceGroup
              label={fa.onboarding.healthQuestion}
              options={healthConditions}
              value={field.value}
              multiple
              onChange={(selected) => {
                const next = selected as string[];
                const none = fa.healthConditions[6];
                const unsure = fa.healthConditions[5];
                if (next.includes(none) || next.includes(unsure)) {
                  field.onChange([next[next.length - 1]]);
                } else {
                  field.onChange(
                    next.filter((item) => item !== none && item !== unsure),
                  );
                }
              }}
            />
          )}
        />
        {errors.healthConditions?.message ? (
          <Text style={{ color: Colors.danger }}>
            {errors.healthConditions.message}
          </Text>
        ) : null}
      </Card>
      {isValid && (
        <Notice tone="warning">{fa.onboarding.medicalGuidance}</Notice>
      )}
      {!isValid && <Notice tone="danger">{fa.onboarding.isValid}</Notice>}
      <Button
        title={saving ? fa.common.saving : fa.onboarding.start}
        disabled={saving || !isValid}
        onPress={handleSubmit(submit)}
      />
    </Page>
  );
}
