import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useNavigation } from "expo-router";
import { ArrowRightIcon } from "lucide-react-native";
import { useLayoutEffect, useState } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { View } from "react-native";
import { z } from "zod";
import { getProfile, updateProfileDetails } from "@/db/repository";
import fa from "@/i18n/fa.json";
import { formatMessage } from "@/i18n/format";
import { jalaliDateLabel } from "@/lib/dates";
import { Button, Card, ChoiceGroup, Field, Page, Text } from "@/ui";
import DeleteAllRecords from "@/ui/delete-all-records";
import { IconButton } from "@/ui/icon-button";
import { Colors, Styles } from "@/ui/theme";

const regularityOptions = ["regular", "irregular", "unknown"] as const;

const editSchema = z.object({
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
  currentWeight: z
    .string()
    .regex(/^\d+(\.\d+)?$/, fa.onboarding.validation.weightNumber)
    .transform(Number)
    .pipe(
      z.number().min(20, fa.trends.weightRange).max(300, fa.trends.weightRange),
    ),
  regularity: z.enum(regularityOptions),
  cycleLength: z
    .string()
    .regex(/^\d+$/, fa.onboarding.validation.cycleInterval)
    .transform(Number)
    .pipe(z.number().int().min(18).max(45)),
  periodDuration: z
    .string()
    .regex(/^\d+$/, fa.onboarding.validation.periodDuration)
    .transform(Number)
    .pipe(z.number().int().min(1).max(10)),
});

type EditFormInput = z.input<typeof editSchema>;
type EditFormOutput = z.output<typeof editSchema>;

export default function ProfileScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<EditFormInput, unknown, EditFormOutput>({
    resolver: zodResolver(editSchema),
    mode: "onChange",
  });

  const { data: user } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: fa.profile.title,
      headerTitleAlign: "center",
      tabBarStyle: {
        display: "none",
      },
      headerLeft: () => (
        <IconButton icon={ArrowRightIcon} onPress={() => router.back()} />
      ),
      headerRight: () => null,
    });
  }, [navigation]);

  const editMutation = useMutation({
    mutationFn: (value: EditFormOutput) =>
      updateProfileDetails({
        name: value.name,
        age: value.age,
        heightCm: value.heightCm,
        regularity: value.regularity,
        averageCycleDays: value.cycleLength,
        periodDurationDays: value.periodDuration,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["profile"] }),
        queryClient.invalidateQueries({ queryKey: ["weight-entries"] }),
      ]);
      setEditing(false);
    },
  });

  const startEditing = () => {
    if (!user) return;
    reset({
      name: user.name,
      age: String(user.age),
      heightCm: String(user.heightCm),
      currentWeight: String(user.initialWeightKg),
      regularity:
        user.regularity === "regular" || user.regularity === "irregular"
          ? user.regularity
          : "unknown",
      cycleLength: String(user.averageCycleDays),
      periodDuration: String(user.periodDurationDays),
    });
    editMutation.reset();
    setEditing(true);
  };

  const cancelEditing = () => {
    editMutation.reset();
    setEditing(false);
  };

  const saveEdits: SubmitHandler<EditFormOutput> = (value) => {
    editMutation.mutate(value);
  };

  return (
    <Page>
      {user ? (
        <Card>
          {editing ? (
            <>
              <Text style={Styles.sectionTitle}>{fa.profile.initialInfo}</Text>
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
                name="cycleLength"
                render={({ field }) => (
                  <Field
                    label={fa.profile.cycleLength}
                    keyboardType="number-pad"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={errors.cycleLength?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="periodDuration"
                render={({ field }) => (
                  <Field
                    label={fa.profile.periodDuration}
                    keyboardType="number-pad"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={errors.periodDuration?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="regularity"
                render={({ field }) => (
                  <ChoiceGroup
                    label={fa.profile.regularity}
                    options={regularityOptions}
                    value={field.value}
                    onChange={field.onChange}
                    getLabel={(value) => fa.onboarding.regularity[value]}
                  />
                )}
              />
              <ProfileRow
                label={fa.profile.lastPeriod}
                value={jalaliDateLabel(
                  new Date(`${user.lastPeriodStart}T12:00:00`),
                )}
              />
              {editMutation.error ? (
                <Text style={{ color: Colors.danger }}>
                  {formatMessage(fa.profile.editFailed, {
                    error: editMutation.error.message,
                  })}
                </Text>
              ) : null}
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Button
                    title={fa.common.cancel}
                    secondary
                    disabled={editMutation.isPending}
                    onPress={cancelEditing}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    title={
                      editMutation.isPending ? fa.common.saving : fa.common.save
                    }
                    disabled={!isValid || editMutation.isPending}
                    onPress={handleSubmit(saveEdits)}
                  />
                </View>
              </View>
            </>
          ) : (
            <>
              <Text style={Styles.sectionTitle}>{fa.profile.initialInfo}</Text>
              <ProfileRow label={fa.onboarding.name} value={user.name} />
              <ProfileRow
                label={fa.onboarding.age}
                value={formatMessage(fa.profile.ageYears, { age: user.age })}
              />
              <ProfileRow
                label={fa.onboarding.height}
                value={formatMessage(fa.profile.height, {
                  height: user.heightCm,
                })}
              />
              <ProfileRow
                label={fa.onboarding.currentWeight}
                value={formatMessage(fa.profile.initialWeight, {
                  weight: user.initialWeightKg,
                })}
              />
              <ProfileRow
                label={fa.profile.regularity}
                value={
                  fa.profile[
                    user.regularity === "regular" ||
                    user.regularity === "irregular"
                      ? user.regularity
                      : "unknown"
                  ]
                }
              />
              <ProfileRow
                label={fa.profile.cycleLength}
                value={`${user.averageCycleDays} ${fa.common.days}`}
              />
              <ProfileRow
                label={fa.profile.periodDuration}
                value={`${user.periodDurationDays} ${fa.common.days}`}
              />
              <ProfileRow
                label={fa.profile.lastPeriod}
                value={jalaliDateLabel(
                  new Date(`${user.lastPeriodStart}T12:00:00`),
                )}
              />
              <Button title={fa.common.edit} secondary onPress={startEditing} />
            </>
          )}
        </Card>
      ) : null}

      {!editing && <DeleteAllRecords />}
    </Page>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ color: Colors.muted }}>{label}</Text>
      <Text style={{ color: Colors.ink, fontWeight: "600" }}>{value}</Text>
    </View>
  );
}
