import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { ThemeColors } from "@/features/settings/types";
import type { LibrePerson } from "@/providers/libre/types";

interface Props {
  people: LibrePerson[];
  theme: ThemeColors;
  onPick: (person: LibrePerson) => void;
  onBack: () => void;
}

/** After a LibreLinkUp login that follows more than one person: who should Spike show? */
export function PersonPicker({ people, theme, onPick, onBack }: Props) {
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>{t("login.pickPerson.title")}</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t("login.pickPerson.subtitle")}</Text>

      {people.map((person) => (
        <TouchableOpacity
          key={person.patientId}
          style={[styles.person, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => onPick(person)}
        >
          <Text style={[styles.personName, { color: theme.text }]}>{person.name}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.back} onPress={onBack}>
        <Text style={[styles.backText, { color: theme.textSecondary }]}>{t("login.pickPerson.back")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
  },
  person: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  personName: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  back: {
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 12,
  },
  backText: {
    fontSize: 15,
  },
});
