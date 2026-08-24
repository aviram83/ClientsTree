export enum ClientStatus {
  CLIENT = "CLIENT",
  CLIENT_VIP = "CLIENT_VIP",
  DISTRIBUTOR = "DISTRIBUTOR",
  SUPERVISOR = "SUPERVISOR",
}

export const STATUS_CONFIG = {
  [ClientStatus.CLIENT]: {
    labelKey: "status.CLIENT",
    colorClass: "bg-status-client",
    inactiveColorClass: "bg-status-inactive",
    cssVar: "--status-client",
  },
  [ClientStatus.CLIENT_VIP]: {
    labelKey: "status.CLIENT_VIP",
    colorClass: "bg-status-client-vip",
    inactiveColorClass: "bg-status-inactive",
    cssVar: "--status-client-vip",
  },
  [ClientStatus.DISTRIBUTOR]: {
    labelKey: "status.DISTRIBUTOR",
    colorClass: "bg-status-distributor",
    inactiveColorClass: "bg-status-inactive",
    cssVar: "--status-distributor",
  },
  [ClientStatus.SUPERVISOR]: {
    labelKey: "status.SUPERVISOR",
    colorClass: "bg-status-supervisor",
    inactiveColorClass: "bg-status-inactive",
    cssVar: "--status-supervisor",
  },
};
