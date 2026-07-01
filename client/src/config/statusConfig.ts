export enum ClientStatus {
  CLIENT = "CLIENT",
  CLIENT_VIP = "CLIENT_VIP",
  DISTRIBUTOR = "DISTRIBUTOR",
  SUPERVISOR = "SUPERVISOR",
}

export const STATUS_CONFIG = {
  [ClientStatus.CLIENT]: {
    label: "לקוח",
    colorClass: "bg-status-client",
    inactiveColorClass: "bg-status-inactive",
    cssVar: "--status-client",
  },
  [ClientStatus.CLIENT_VIP]: {
    label: "לקוח VIP",
    colorClass: "bg-status-client-vip",
    inactiveColorClass: "bg-status-inactive",
    cssVar: "--status-client-vip",
  },
  [ClientStatus.DISTRIBUTOR]: {
    label: "מפיץ",
    colorClass: "bg-status-distributor",
    inactiveColorClass: "bg-status-inactive",
    cssVar: "--status-distributor",
  },
  [ClientStatus.SUPERVISOR]: {
    label: "מפקח",
    colorClass: "bg-status-supervisor",
    inactiveColorClass: "bg-status-inactive",
    cssVar: "--status-supervisor",
  },
};
