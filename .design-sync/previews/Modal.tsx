import * as React from 'react';
import { Modal, Button, Label, Input } from 'client';

const noop = () => {};

/**
 * Modal is a fixed full-screen overlay with its own scrim — it renders nothing
 * at all when `isOpen` is false, so every preview passes `isOpen`.
 */
export const ConfirmDelete = () => (
  <div className="relative h-[520px] w-full">
    <Modal isOpen onClose={noop} title="מחיקת לקוח">
      <p className="text-sm">
        מחיקת דנה שפירא תמחק גם את שלושת הלקוחות שמתחתיה. הפעולה אינה הפיכה.
      </p>
      <div className="mt-4 flex gap-2">
        <Button variant="destructive">מחק</Button>
        <Button variant="outline">ביטול</Button>
      </div>
    </Modal>
  </div>
);

/** The shape DashboardPage uses: a form inside the modal body. */
export const WithForm = () => (
  <div className="relative h-[520px] w-full">
    <Modal isOpen onClose={noop} title="הוספת לקוח">
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="modal-name">שם הלקוח</Label>
          <Input id="modal-name" placeholder="לדוגמה: נועה גל" />
        </div>
        <Button className="w-full">שמור</Button>
      </div>
    </Modal>
  </div>
);
