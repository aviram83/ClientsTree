// client/src/config/statusConfig.ts

export enum ClientStatus {
  CLIENT = "CLIENT",
  CLIENT_VIP = "CLIENT_VIP",
  DISTRIBUTOR = "DISTRIBUTOR",
  SUPERVISOR = "SUPERVISOR",
}

export const STATUS_CONFIG = {
  [ClientStatus.CLIENT]: { label: "לקוח", colorClass: "bg-yellow-400", inactiveColorClass: "bg-gray-300" },
  [ClientStatus.CLIENT_VIP]: { label: "לקוח VIP", colorClass: "bg-blue-400", inactiveColorClass: "bg-gray-300" },
  [ClientStatus.DISTRIBUTOR]: { label: "מפיץ", colorClass: "bg-red-400", inactiveColorClass: "bg-gray-300" },
  [ClientStatus.SUPERVISOR]: { label: "מפקח", colorClass: "bg-green-400", inactiveColorClass: "bg-gray-300" },
};