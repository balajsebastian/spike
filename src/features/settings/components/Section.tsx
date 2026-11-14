import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { Text, View } from "react-native";
import type { ThemeColors } from "../types";
import { listStyles } from "./styles";

interface Props {
  title?: string;
  footer?: string | false;
  footerColor?: string;
  theme: ThemeColors;
  children: ReactNode;
}

/** A titled card of rows with hairline separators between them, iOS inset-grouped style. */
export function Section({ title, footer, footerColor, theme, children }: Props) {
  const rows = flattenChildren(children);

  return (
    <View style={listStyles.section}>
      {title && <Text style={[listStyles.sectionHeader, { color: theme.textSecondary }]}>{title}</Text>}
      <View style={[listStyles.card, { backgroundColor: theme.surface }]}>
        {rows.map((row, index) => (
          <View key={index}>
            {index > 0 && <View style={[listStyles.separator, { backgroundColor: theme.border }]} />}
            {row}
          </View>
        ))}
      </View>
      {footer ? (
        <Text style={[listStyles.sectionFooter, { color: footerColor ?? theme.textSecondary }]}>{footer}</Text>
      ) : null}
    </View>
  );
}

// Flatten fragments and drop conditional `false` children so separators only sit between real rows.
function flattenChildren(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? flattenChildren(child.props.children)
      : [child],
  );
}
