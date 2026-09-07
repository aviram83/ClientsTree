import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from 'client';

/**
 * CardDescription is the muted subtitle under CardTitle — secondary metadata, never the primary label.
 * Rendered in its parent Card, which is the only context it is used in.
 */
export const InCard = () => (
  <div className="w-96 p-6">
    <Card>
      <CardHeader>
        <CardTitle>עמית פרץ</CardTitle>
        <CardDescription>מפיץ · 35% הנחה</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        שני לקוחות פעילים תחתיו: נועה גל ואיתי רוזן.
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm">ערוך</Button>
        <Button size="sm" variant="ghost">
          סגור
        </Button>
      </CardFooter>
    </Card>
  </div>
);
