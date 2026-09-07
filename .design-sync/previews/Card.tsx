import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Separator } from 'client';

/** The full anatomy: header (title + description), content, footer. */
export const ClientSummary = () => (
  <div className="w-96 p-6">
    <Card>
      <CardHeader>
        <CardTitle>דנה שפירא</CardTitle>
        <CardDescription>לקוח VIP · הצטרפה בינואר 2026</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">אחוז הנחה</span>
          <span className="font-medium">42%</span>
        </div>
        <Separator />
        <div className="flex justify-between">
          <span className="text-muted-foreground">לקוחות מתחת</span>
          <span className="font-medium">3</span>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm">ערוך</Button>
        <Button size="sm" variant="outline">
          הצג בעץ
        </Button>
      </CardFooter>
    </Card>
  </div>
);

/** Header + content only — the shape most of the app's panels actually use. */
export const Minimal = () => (
  <div className="w-96 p-6">
    <Card>
      <CardHeader>
        <CardTitle>ניקוד אישי</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        שמונה לקוחות פעילים מוצגים בבית, מתוכם שניים במחיר מלא.
      </CardContent>
    </Card>
  </div>
);
