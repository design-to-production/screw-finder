import type { FullCardPdfModel, FullCardPdfSection } from "@/lib/cw-screws/fullCardPdfModel";
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 42,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
    backgroundColor: "#ffffff",
  },
  headerTitle: { fontSize: 18, marginBottom: 6, fontFamily: "Helvetica-Bold" },
  headerSub: { fontSize: 9, color: "#444444", marginBottom: 6 },
  metaLine: { fontSize: 9, color: "#555555", marginBottom: 12 },
  previewWrap: { alignItems: "center", marginBottom: 16 },
  previewImage: {
    width: 260,
    height: 195,
    backgroundColor: "#1e1e1e",
    objectFit: "contain" as const,
  },
  previewCaption: {
    fontSize: 8,
    color: "#666666",
    marginTop: 6,
    textAlign: "center",
  },
  warn: { fontSize: 9, color: "#b45309", marginBottom: 14 },
  sectionTitle: {
    fontSize: 11,
    marginTop: 4,
    marginBottom: 10,
    fontFamily: "Helvetica-Bold",
    color: "#333333",
  },
  row: { flexDirection: "row", marginBottom: 5, paddingRight: 6 },
  labelCol: { width: "32%", color: "#555555" },
  valueCol: { width: "68%", flexShrink: 1 },
  valueMono: { fontFamily: "Courier", fontSize: 8, lineHeight: 1.35 },
  footerNote: {
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    fontSize: 8,
    color: "#888888",
  },
});

function FieldRows({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <>
      {rows.map((r, i) => {
        const mono = r.value.includes("\n") || r.value.length > 120;
        return (
          <View key={i} style={styles.row} wrap={false}>
            <Text style={styles.labelCol}>{r.label}</Text>
            <Text style={[styles.valueCol, mono ? styles.valueMono : {}]}>{r.value}</Text>
          </View>
        );
      })}
    </>
  );
}

function FieldsSection({ section }: { section: FullCardPdfSection }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <FieldRows rows={section.rows} />
    </View>
  );
}

function CoverHeader({ model }: { model: FullCardPdfModel }) {
  return (
    <>
      <Text style={styles.headerTitle}>{model.title}</Text>
      <Text style={styles.headerSub}>{model.itemIdLine}</Text>
      <Text style={styles.metaLine}>
        List index {model.listIndex} / {model.totalEntries} entries · Screw Finder export
      </Text>
      {model.previewImageSrc ? (
        <View style={styles.previewWrap}>
          <Image src={model.previewImageSrc} style={styles.previewImage} />
          <Text style={styles.previewCaption}>Geometry preview (same render as Cards)</Text>
        </View>
      ) : null}
      {model.missingCatalogItem ? (
        <Text style={styles.warn}>Catalog item not found for this row.</Text>
      ) : null}
    </>
  );
}

export function FullCardPdfDocument({ model }: { model: FullCardPdfModel }) {
  const sections = model.sections;
  const [first, ...rest] = sections;
  const footerText =
    "Connector data export for planning reference; verify against live catalog where required.";

  return (
    <Document title={model.title} subject="Screw full card">
      <Page size="A4" style={styles.page}>
        <CoverHeader model={model} />
        {first ? <FieldsSection section={first} /> : null}
        {rest.length === 0 ? <Text style={styles.footerNote}>{footerText}</Text> : null}
      </Page>
      {rest.map((section, i) => (
        <Page key={i} size="A4" style={styles.page}>
          <FieldsSection section={section} />
          {i === rest.length - 1 ? <Text style={styles.footerNote}>{footerText}</Text> : null}
        </Page>
      ))}
    </Document>
  );
}
