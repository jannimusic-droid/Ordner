import { PrismaClient, Priority, TopicStatus, TaskStatus, Role, ActivityAction, EntityType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
}

async function main() {
  console.log("Lösche vorhandene Daten…");
  await prisma.notification.deleteMany();
  await prisma.activityLogEntry.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.taskParticipant.deleteMany();
  await prisma.task.deleteMany();
  await prisma.topicParticipant.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.department.updateMany({ data: { leadId: null } });
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  console.log("Lege Abteilungen an…");
  const departmentNames = [
    "Geschäftsführung",
    "Vertrieb",
    "Produktion",
    "Arbeitsvorbereitung",
    "Logistik",
    "Qualität",
    "Personal",
    "Einkauf",
    "Technik",
    "Buchhaltung",
    "IT",
  ];
  const departments: Record<string, { id: string }> = {};
  for (const name of departmentNames) {
    departments[name] = await prisma.department.create({ data: { name } });
  }

  console.log("Lege Nutzer an…");
  const adminHash = await bcrypt.hash("admin123", 10);
  const demoHash = await bcrypt.hash("demo123", 10);

  type SeedUser = { key: string; name: string; email: string; role: Role; dept: string; hash: string };
  const seedUsers: SeedUser[] = [
    { key: "petra", name: "Petra Vogt", email: "admin@ordner.app", role: Role.ADMIN, dept: "Geschäftsführung", hash: adminHash },
    { key: "anna", name: "Anna Krause", email: "anna.krause@ordner.app", role: Role.MANAGER, dept: "Vertrieb", hash: demoHash },
    { key: "jan", name: "Jan Weber", email: "jan.weber@ordner.app", role: Role.EMPLOYEE, dept: "Vertrieb", hash: demoHash },
    { key: "stefan", name: "Stefan Holm", email: "stefan.holm@ordner.app", role: Role.MANAGER, dept: "Produktion", hash: demoHash },
    { key: "maria", name: "Maria Fischer", email: "maria.fischer@ordner.app", role: Role.EMPLOYEE, dept: "Produktion", hash: demoHash },
    { key: "timo", name: "Timo Krüger", email: "timo.krueger@ordner.app", role: Role.MANAGER, dept: "Arbeitsvorbereitung", hash: demoHash },
    { key: "laura", name: "Laura Schmid", email: "laura.schmid@ordner.app", role: Role.MANAGER, dept: "Logistik", hash: demoHash },
    { key: "ben", name: "Ben Alt", email: "ben.alt@ordner.app", role: Role.EMPLOYEE, dept: "Logistik", hash: demoHash },
    { key: "nina", name: "Nina Groß", email: "nina.gross@ordner.app", role: Role.MANAGER, dept: "Qualität", hash: demoHash },
    { key: "felix", name: "Felix Wagner", email: "felix.wagner@ordner.app", role: Role.EMPLOYEE, dept: "Qualität", hash: demoHash },
    { key: "claudia", name: "Claudia Peters", email: "claudia.peters@ordner.app", role: Role.MANAGER, dept: "Personal", hash: demoHash },
    { key: "sophie", name: "Sophie Lang", email: "sophie.lang@ordner.app", role: Role.EMPLOYEE, dept: "Einkauf", hash: demoHash },
    { key: "david", name: "David Roth", email: "david.roth@ordner.app", role: Role.MANAGER, dept: "IT", hash: demoHash },
    { key: "erik", name: "Erik Sommer", email: "erik.sommer@ordner.app", role: Role.EMPLOYEE, dept: "IT", hash: demoHash },
    { key: "julia", name: "Julia Braun", email: "julia.braun@ordner.app", role: Role.EMPLOYEE, dept: "Buchhaltung", hash: demoHash },
    { key: "marco", name: "Marco Bauer", email: "marco.bauer@ordner.app", role: Role.EMPLOYEE, dept: "Technik", hash: demoHash },
  ];

  const users: Record<string, { id: string; name: string }> = {};
  for (const su of seedUsers) {
    const u = await prisma.user.create({
      data: {
        name: su.name,
        email: su.email,
        passwordHash: su.hash,
        role: su.role,
        departmentId: departments[su.dept].id,
      },
    });
    users[su.key] = { id: u.id, name: u.name };
  }

  // Abteilungsleitungen setzen
  await prisma.department.update({ where: { id: departments["Geschäftsführung"].id }, data: { leadId: users.petra.id } });
  await prisma.department.update({ where: { id: departments["Vertrieb"].id }, data: { leadId: users.anna.id } });
  await prisma.department.update({ where: { id: departments["Produktion"].id }, data: { leadId: users.stefan.id } });
  await prisma.department.update({ where: { id: departments["Arbeitsvorbereitung"].id }, data: { leadId: users.timo.id } });
  await prisma.department.update({ where: { id: departments["Logistik"].id }, data: { leadId: users.laura.id } });
  await prisma.department.update({ where: { id: departments["Qualität"].id }, data: { leadId: users.nina.id } });
  await prisma.department.update({ where: { id: departments["Personal"].id }, data: { leadId: users.claudia.id } });
  await prisma.department.update({ where: { id: departments["IT"].id }, data: { leadId: users.david.id } });

  console.log("Lege Themen und Aufgaben an…");

  type TaskSeed = {
    title: string;
    description: string;
    owner: string;
    participants?: string[];
    priority: Priority;
    status: TaskStatus;
    start: number;
    due: number | null;
    nextStep: string | null;
    effort?: string;
    comments?: { author: string; text: string; daysAgo: number }[];
  };

  type TopicSeed = {
    title: string;
    description: string;
    dept: string;
    owner: string;
    participants?: string[];
    priority: Priority;
    status: TopicStatus;
    cross?: boolean;
    start: number;
    due: number | null;
    nextStep: string | null;
    tasks: TaskSeed[];
  };

  const topicSeeds: TopicSeed[] = [
    {
      title: "Produktionsplanung optimieren",
      description:
        "Der aktuelle Produktionsplan führt zu häufigen Umplanungen und Reibungsverlusten zwischen Schichten. Ziel ist ein robuster, klar kommunizierter Planungsprozess.",
      dept: "Produktion",
      owner: "stefan",
      participants: ["maria", "timo"],
      priority: Priority.HIGH,
      status: TopicStatus.IN_PROGRESS,
      start: -21,
      due: 10,
      nextStep: "Entwurf des neuen Produktionsplans mit Arbeitsvorbereitung abstimmen",
      tasks: [
        {
          title: "Produktionsplan aktualisieren",
          description: "Bestehenden Produktionsplan an aktuelle Auftragslage anpassen.",
          owner: "stefan",
          participants: ["maria"],
          priority: Priority.HIGH,
          status: TaskStatus.IN_PROGRESS,
          start: -14,
          due: 3,
          nextStep: "Kapazitäten für KW38 gegenprüfen",
          comments: [
            { author: "stefan", text: "Erste Entwurfsversion steht, Abstimmung mit Schichtleitern läuft.", daysAgo: 4 },
          ],
        },
        {
          title: "Verantwortlichkeiten definieren",
          description: "Klare Zuständigkeiten je Produktionslinie festlegen und dokumentieren.",
          owner: "maria",
          priority: Priority.MEDIUM,
          status: TaskStatus.OPEN,
          start: -7,
          due: 14,
          nextStep: "Verantwortlichkeitsmatrix je Linie erstellen",
        },
        {
          title: "Neue Planungsregelung kommunizieren",
          description: "Alle Beteiligten über die neue Planungslogik informieren.",
          owner: "stefan",
          participants: ["timo", "maria"],
          priority: Priority.MEDIUM,
          status: TaskStatus.OPEN,
          start: -3,
          due: 21,
          nextStep: "Termin für Schichtbesprechung finden",
        },
      ],
    },
    {
      title: "Kundenprojekt Müller GmbH",
      description: "Anfrage der Müller GmbH für ein individuelles Fertigungsprojekt. Kalkulation, Angebot und Nachverfolgung.",
      dept: "Vertrieb",
      owner: "anna",
      participants: ["jan"],
      priority: Priority.HIGH,
      status: TopicStatus.WAITING,
      start: -10,
      due: 5,
      nextStep: "Rückmeldung des Kunden zum Angebot nachfassen",
      tasks: [
        {
          title: "Kalkulation erstellen",
          description: "Kosten- und Preiskalkulation für das Projekt Müller GmbH.",
          owner: "jan",
          priority: Priority.HIGH,
          status: TaskStatus.DONE,
          start: -10,
          due: -5,
          nextStep: null,
        },
        {
          title: "Angebot versenden",
          description: "Finales Angebot an die Müller GmbH übermitteln.",
          owner: "jan",
          participants: ["anna"],
          priority: Priority.HIGH,
          status: TaskStatus.DONE,
          start: -6,
          due: -2,
          nextStep: null,
          comments: [
            { author: "jan", text: "Angebot wurde beim Lieferanten angefragt.", daysAgo: 6 },
            { author: "jan", text: "Angebot erhalten. Entscheidung durch Geschäftsführung erforderlich.", daysAgo: 4 },
            { author: "anna", text: "Angebot final an Kunden versendet.", daysAgo: 2 },
          ],
        },
        {
          title: "Kundenrückmeldung nachverfolgen",
          description: "Nachfassen beim Kunden zur Angebotsentscheidung.",
          owner: "anna",
          participants: ["jan"],
          priority: Priority.HIGH,
          status: TaskStatus.WAITING,
          start: -2,
          due: 1,
          nextStep: "Telefonisch beim Einkauf der Müller GmbH nachfragen",
          comments: [{ author: "anna", text: "Kunde bittet um zwei weitere Tage Bedenkzeit.", daysAgo: 1 }],
        },
      ],
    },
    {
      title: "Glasfaseranschluss",
      description: "Anbindung des Standorts an das Glasfasernetz zur Verbesserung der Internetanbindung.",
      dept: "IT",
      owner: "david",
      participants: ["erik"],
      priority: Priority.MEDIUM,
      status: TopicStatus.OPEN,
      start: -15,
      due: 30,
      nextStep: "Vergleichsangebote der drei Anbieter zusammenfassen",
      tasks: [
        {
          title: "Angebote vergleichen",
          description: "Angebote verschiedener Anbieter für den Glasfaseranschluss einholen und vergleichen.",
          owner: "erik",
          priority: Priority.MEDIUM,
          status: TaskStatus.IN_PROGRESS,
          start: -15,
          due: 2,
          nextStep: "Drittes Angebot von Anbieter C anfordern",
        },
        {
          title: "Baukosten klären",
          description: "Kosten für Tiefbauarbeiten mit den Anbietern klären.",
          owner: "david",
          priority: Priority.MEDIUM,
          status: TaskStatus.OPEN,
          start: -8,
          due: 12,
          nextStep: "Vor-Ort-Termin mit Anbieter B vereinbaren",
        },
        {
          title: "Anbieterentscheidung vorbereiten",
          description: "Entscheidungsvorlage für die Geschäftsführung erstellen.",
          owner: "david",
          priority: Priority.LOW,
          status: TaskStatus.OPEN,
          start: -1,
          due: 25,
          nextStep: null,
        },
      ],
    },
    {
      title: "Lagerumstrukturierung Halle 2",
      description: "Neuordnung der Lagerplätze in Halle 2 zur Reduzierung von Wegzeiten.",
      dept: "Logistik",
      owner: "laura",
      participants: ["ben"],
      priority: Priority.MEDIUM,
      status: TopicStatus.IN_PROGRESS,
      start: -30,
      due: -2,
      nextStep: "Umzugstermin final mit Produktion abstimmen",
      tasks: [
        {
          title: "Regale planen",
          description: "Neue Regalanordnung planen und Flächenbedarf berechnen.",
          owner: "ben",
          priority: Priority.MEDIUM,
          status: TaskStatus.DONE,
          start: -30,
          due: -15,
          nextStep: null,
        },
        {
          title: "Angebote Lagerbau einholen",
          description: "Angebote für Regalsysteme und Montage einholen.",
          owner: "ben",
          priority: Priority.MEDIUM,
          status: TaskStatus.BLOCKED,
          start: -20,
          due: -3,
          nextStep: "Rückmeldung des Lieferanten zur Lieferzeit abwarten",
          comments: [{ author: "ben", text: "Lieferant meldet Lieferverzug von drei Wochen. Alternative wird geprüft.", daysAgo: 5 }],
        },
        {
          title: "Umzugstermin festlegen",
          description: "Termin für den Umzug der Lagerbestände mit Produktion abstimmen.",
          owner: "laura",
          priority: Priority.HIGH,
          status: TaskStatus.BLOCKED,
          start: -5,
          due: -1,
          nextStep: "Nach Klärung der Regallieferung neuen Termin vorschlagen",
        },
      ],
    },
    {
      title: "ISO 9001 Rezertifizierung",
      description: "Vorbereitung und Durchführung der Rezertifizierung nach ISO 9001.",
      dept: "Qualität",
      owner: "nina",
      participants: ["felix"],
      priority: Priority.CRITICAL,
      status: TopicStatus.IN_PROGRESS,
      start: -40,
      due: 0,
      nextStep: "Letzte offene Dokumente für das Audit vervollständigen",
      tasks: [
        {
          title: "Auditunterlagen vorbereiten",
          description: "Alle notwendigen Nachweise und Dokumente für das Audit zusammenstellen.",
          owner: "felix",
          priority: Priority.CRITICAL,
          status: TaskStatus.IN_PROGRESS,
          start: -20,
          due: 0,
          nextStep: "Fehlende Nachweise aus der Produktion anfordern",
        },
        {
          title: "Internes Audit durchführen",
          description: "Internes Voraudit zur Vorbereitung auf die externe Zertifizierung.",
          owner: "nina",
          priority: Priority.HIGH,
          status: TaskStatus.OPEN,
          start: -10,
          due: 4,
          nextStep: "Termin mit den Abteilungsleitungen abstimmen",
        },
        {
          title: "Auditor beauftragen",
          description: "Externen Auditor für den Zertifizierungstermin beauftragen.",
          owner: "nina",
          priority: Priority.MEDIUM,
          status: TaskStatus.DONE,
          start: -35,
          due: -20,
          nextStep: null,
        },
      ],
    },
    {
      title: "Onboarding-Prozess überarbeiten",
      description: "Strukturierter Einarbeitungsprozess für neue Mitarbeitende.",
      dept: "Personal",
      owner: "claudia",
      priority: Priority.MEDIUM,
      status: TopicStatus.OPEN,
      start: -5,
      due: 45,
      nextStep: "Checkliste mit den Abteilungsleitungen abstimmen",
      tasks: [
        {
          title: "Checkliste erstellen",
          description: "Standard-Checkliste für den ersten Arbeitstag erstellen.",
          owner: "claudia",
          priority: Priority.MEDIUM,
          status: TaskStatus.OPEN,
          start: -5,
          due: 10,
          nextStep: "Entwurf an Führungskräfte zur Prüfung senden",
        },
        {
          title: "Einarbeitungsplan-Vorlage erstellen",
          description: "Vorlage für individuelle 30-60-90-Tage-Pläne.",
          owner: "claudia",
          priority: Priority.LOW,
          status: TaskStatus.OPEN,
          start: -2,
          due: 30,
          nextStep: null,
        },
        {
          title: "Buddy-System einführen",
          description: "Patensystem für neue Mitarbeitende konzipieren.",
          owner: "claudia",
          priority: Priority.LOW,
          status: TaskStatus.OPEN,
          start: 0,
          due: 45,
          nextStep: "Freiwillige Paten je Abteilung anfragen",
        },
      ],
    },
    {
      title: "Lieferantenwechsel Rohstoff X",
      description: "Prüfung eines Lieferantenwechsels aufgrund steigender Preise und Lieferverzögerungen.",
      dept: "Einkauf",
      owner: "sophie",
      priority: Priority.HIGH,
      status: TopicStatus.NEW,
      start: 0,
      due: 20,
      nextStep: null,
      tasks: [
        {
          title: "Alternativlieferanten prüfen",
          description: "Marktrecherche zu alternativen Lieferanten für Rohstoff X.",
          owner: "sophie",
          priority: Priority.HIGH,
          status: TaskStatus.OPEN,
          start: 0,
          due: 7,
          nextStep: "Erste Anfragen an drei potenzielle Lieferanten senden",
        },
        {
          title: "Probelieferung bestellen",
          description: "Testbestellung beim vielversprechendsten Lieferanten auslösen.",
          owner: "sophie",
          priority: Priority.MEDIUM,
          status: TaskStatus.OPEN,
          start: 0,
          due: 14,
          nextStep: null,
        },
        {
          title: "Vertrag verhandeln",
          description: "Konditionen und Vertrag mit dem ausgewählten Lieferanten verhandeln.",
          owner: "sophie",
          priority: Priority.MEDIUM,
          status: TaskStatus.OPEN,
          start: 0,
          due: 20,
          nextStep: null,
        },
      ],
    },
    {
      title: "Wartungsplan Maschinenpark",
      description: "Überarbeitung des Wartungsplans zur Reduzierung ungeplanter Stillstände.",
      dept: "Technik",
      owner: "marco",
      priority: Priority.MEDIUM,
      status: TopicStatus.IN_PROGRESS,
      start: -18,
      due: 15,
      nextStep: "Wartungsintervalle mit Herstellerangaben abgleichen",
      tasks: [
        {
          title: "Wartungsintervalle prüfen",
          description: "Bestehende Wartungsintervalle mit Herstellerempfehlungen abgleichen.",
          owner: "marco",
          priority: Priority.MEDIUM,
          status: TaskStatus.IN_PROGRESS,
          start: -18,
          due: 6,
          nextStep: "Herstellerdokumentation für Anlage 4 einsehen",
        },
        {
          title: "Wartungsverträge erneuern",
          description: "Auslaufende Wartungsverträge prüfen und verlängern.",
          owner: "marco",
          priority: Priority.MEDIUM,
          status: TaskStatus.OPEN,
          start: -5,
          due: 15,
          nextStep: null,
        },
        {
          title: "Ersatzteillager aufbauen",
          description: "Kritische Ersatzteile identifizieren und Mindestbestände definieren.",
          owner: "marco",
          priority: Priority.LOW,
          status: TaskStatus.OPEN,
          start: 0,
          due: 40,
          nextStep: null,
        },
      ],
    },
    {
      title: "Digitalisierung Rechnungswesen",
      description: "Einführung einer digitalen Rechnungsverarbeitung zur Effizienzsteigerung.",
      dept: "Buchhaltung",
      owner: "julia",
      priority: Priority.LOW,
      status: TopicStatus.OPEN,
      start: -12,
      due: 60,
      nextStep: "Zwei Softwareanbieter zur Demo einladen",
      tasks: [
        {
          title: "Software evaluieren",
          description: "Marktübersicht digitaler Rechnungslösungen erstellen.",
          owner: "julia",
          priority: Priority.LOW,
          status: TaskStatus.IN_PROGRESS,
          start: -12,
          due: 10,
          nextStep: "Demo-Termine mit zwei Anbietern vereinbaren",
        },
        {
          title: "Testphase durchführen",
          description: "Pilotbetrieb mit ausgewählter Software in der Buchhaltung.",
          owner: "julia",
          priority: Priority.LOW,
          status: TaskStatus.OPEN,
          start: 0,
          due: 45,
          nextStep: null,
        },
        {
          title: "Mitarbeiter schulen",
          description: "Schulung des Buchhaltungsteams auf die neue Software.",
          owner: "julia",
          priority: Priority.LOW,
          status: TaskStatus.OPEN,
          start: 0,
          due: 60,
          nextStep: null,
        },
      ],
    },
    {
      title: "Rüstzeiten reduzieren",
      description: "Reduzierung der Rüstzeiten an den Hauptfertigungslinien mittels SMED-Methode.",
      dept: "Arbeitsvorbereitung",
      owner: "timo",
      participants: ["stefan"],
      priority: Priority.HIGH,
      status: TopicStatus.BLOCKED,
      start: -25,
      due: -4,
      nextStep: null,
      tasks: [
        {
          title: "Ist-Analyse durchführen",
          description: "Aktuelle Rüstzeiten je Linie erfassen und dokumentieren.",
          owner: "timo",
          priority: Priority.HIGH,
          status: TaskStatus.DONE,
          start: -25,
          due: -15,
          nextStep: null,
        },
        {
          title: "SMED-Workshop durchführen",
          description: "Workshop mit den Linienteams zur Identifikation von Einsparpotenzialen.",
          owner: "timo",
          participants: ["stefan"],
          priority: Priority.HIGH,
          status: TaskStatus.BLOCKED,
          start: -10,
          due: -4,
          nextStep: "Wartet auf freie Kapazität der Linie 2 für den Workshop-Termin",
          comments: [{ author: "timo", text: "Workshop musste wegen Produktionsengpass verschoben werden.", daysAgo: 3 }],
        },
        {
          title: "Neue Rüstanleitung erstellen",
          description: "Standardisierte Rüstanleitung auf Basis der Workshop-Ergebnisse erstellen.",
          owner: "timo",
          priority: Priority.MEDIUM,
          status: TaskStatus.OPEN,
          start: 0,
          due: 20,
          nextStep: null,
        },
      ],
    },
    {
      title: "Strategie 2027",
      description: "Erarbeitung der Unternehmensstrategie für die Jahre 2027–2029 mit allen Abteilungsleitungen.",
      dept: "Geschäftsführung",
      owner: "petra",
      participants: ["anna", "stefan", "david", "laura", "nina", "claudia"],
      priority: Priority.CRITICAL,
      status: TopicStatus.IN_PROGRESS,
      cross: true,
      start: -30,
      due: 60,
      nextStep: "Strategie-Workshop mit allen Abteilungsleitungen terminieren",
      tasks: [
        {
          title: "Zielbild erarbeiten",
          description: "Gemeinsames strategisches Zielbild für die kommenden drei Jahre entwickeln.",
          owner: "petra",
          participants: ["anna", "stefan"],
          priority: Priority.CRITICAL,
          status: TaskStatus.IN_PROGRESS,
          start: -30,
          due: 5,
          nextStep: "Entwurf des Zielbilds an Führungskräfte zur Kommentierung senden",
        },
        {
          title: "Budgetplanung abstimmen",
          description: "Budgetrahmen je Abteilung für die Strategieumsetzung festlegen.",
          owner: "petra",
          priority: Priority.HIGH,
          status: TaskStatus.OPEN,
          start: 0,
          due: 30,
          nextStep: null,
        },
        {
          title: "Kommunikation an Belegschaft vorbereiten",
          description: "Kommunikationskonzept zur Vorstellung der neuen Strategie erarbeiten.",
          owner: "claudia",
          priority: Priority.MEDIUM,
          status: TaskStatus.OPEN,
          start: 0,
          due: 55,
          nextStep: null,
        },
      ],
    },
    {
      title: "CRM-Systemwechsel",
      description: "Ablösung des veralteten CRM-Systems durch eine moderne, cloudbasierte Lösung.",
      dept: "IT",
      owner: "david",
      participants: ["erik", "anna"],
      priority: Priority.HIGH,
      status: TopicStatus.BLOCKED,
      start: -60,
      due: -10,
      nextStep: null,
      tasks: [
        {
          title: "Anforderungen sammeln",
          description: "Anforderungen von Vertrieb und Geschäftsführung an das neue CRM sammeln.",
          owner: "erik",
          participants: ["anna"],
          priority: Priority.HIGH,
          status: TaskStatus.DONE,
          start: -60,
          due: -45,
          nextStep: null,
        },
        {
          title: "Anbieter evaluieren",
          description: "Marktübersicht und Bewertung geeigneter CRM-Anbieter.",
          owner: "david",
          priority: Priority.HIGH,
          status: TaskStatus.BLOCKED,
          start: -40,
          due: -10,
          nextStep: "Wartet auf Freigabe des Budgets durch die Geschäftsführung",
          comments: [{ author: "david", text: "Ohne Budgetfreigabe kann die engere Auswahl nicht beauftragt werden.", daysAgo: 8 }],
        },
        {
          title: "Datenmigration planen",
          description: "Migrationskonzept für die Übernahme der bestehenden Kundendaten.",
          owner: "erik",
          priority: Priority.MEDIUM,
          status: TaskStatus.OPEN,
          start: 0,
          due: 40,
          nextStep: null,
        },
      ],
    },
  ];

  for (const t of topicSeeds) {
    const topic = await prisma.topic.create({
      data: {
        title: t.title,
        description: t.description,
        departmentId: departments[t.dept].id,
        crossDepartment: t.cross ?? false,
        ownerId: users[t.owner].id,
        priority: t.priority,
        status: t.status,
        startDate: daysFromNow(t.start),
        dueDate: t.due !== null ? daysFromNow(t.due) : null,
        nextStep: t.nextStep,
      },
    });

    for (const p of t.participants ?? []) {
      await prisma.topicParticipant.create({ data: { topicId: topic.id, userId: users[p].id } });
    }

    await prisma.activityLogEntry.create({
      data: {
        entityType: EntityType.TOPIC,
        action: ActivityAction.CREATED,
        description: `Thema „${t.title}“ erstellt`,
        userId: users[t.owner].id,
        topicId: topic.id,
      },
    });

    for (const task of t.tasks) {
      const createdTask = await prisma.task.create({
        data: {
          title: task.title,
          description: task.description,
          topicId: topic.id,
          ownerId: users[task.owner].id,
          priority: task.priority,
          status: task.status,
          startDate: daysFromNow(task.start),
          dueDate: task.due !== null ? daysFromNow(task.due) : null,
          nextStep: task.nextStep,
          estimatedEffort: task.effort,
        },
      });

      for (const p of task.participants ?? []) {
        await prisma.taskParticipant.create({ data: { taskId: createdTask.id, userId: users[p].id } });
      }

      await prisma.activityLogEntry.create({
        data: {
          entityType: EntityType.TASK,
          action: ActivityAction.CREATED,
          description: `Aufgabe „${task.title}“ erstellt`,
          userId: users[task.owner].id,
          taskId: createdTask.id,
        },
      });

      if (task.status === TaskStatus.DONE) {
        await prisma.activityLogEntry.create({
          data: {
            entityType: EntityType.TASK,
            action: ActivityAction.COMPLETED,
            description: `Aufgabe „${task.title}“ als erledigt markiert`,
            userId: users[task.owner].id,
            taskId: createdTask.id,
          },
        });
      }

      for (const c of task.comments ?? []) {
        await prisma.comment.create({
          data: {
            text: c.text,
            authorId: users[c.author].id,
            taskId: createdTask.id,
            createdAt: daysFromNow(-c.daysAgo),
          },
        });
        await prisma.activityLogEntry.create({
          data: {
            entityType: EntityType.TASK,
            action: ActivityAction.COMMENT_ADDED,
            description: `Kommentar hinzugefügt`,
            userId: users[c.author].id,
            taskId: createdTask.id,
            createdAt: daysFromNow(-c.daysAgo),
          },
        });
      }
    }
  }

  console.log("Lege Benachrichtigungen an…");
  await prisma.notification.createMany({
    data: [
      {
        userId: users.jan.id,
        type: "TASK_ASSIGNED",
        message: "Dir wurde die Aufgabe „Kundenrückmeldung nachverfolgen“ zugewiesen.",
        read: false,
      },
      {
        userId: users.erik.id,
        type: "DUE_SOON",
        message: "Die Aufgabe „Angebote vergleichen“ ist bald fällig.",
        read: false,
      },
      {
        userId: users.david.id,
        type: "OVERDUE",
        message: "Die Aufgabe „Anbieter evaluieren“ ist überfällig.",
        read: false,
      },
      {
        userId: users.anna.id,
        type: "NEW_COMMENT",
        message: "Neuer Kommentar zu „Kundenrückmeldung nachverfolgen“.",
        read: true,
      },
      {
        userId: users.timo.id,
        type: "STATUS_CHANGED",
        message: "Der Status von „SMED-Workshop durchführen“ wurde auf Blockiert geändert.",
        read: false,
      },
    ],
  });

  console.log("Seed abgeschlossen.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
