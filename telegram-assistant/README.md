# עוזר אישי בטלגרם

בוט טלגרם אישי: תזכורות ומשימות, פתקים, מעקב הוצאות, וצ'אט חכם (AI).
לאפיון המלא ראו [SPEC.md](./SPEC.md).

## התקנה

1. יצירת בוט חדש ב-[@BotFather](https://t.me/BotFather) וקבלת טוקן.
2. העתקת קובץ הסביבה:
   ```bash
   cp .env.example .env
   ```
   ומילוי `TELEGRAM_BOT_TOKEN` (חובה) ו-`ANTHROPIC_API_KEY` (אופציונלי, לצ'אט החכם).
3. התקנת תלויות:
   ```bash
   npm install
   ```
4. הרצה:
   ```bash
   npm start
   ```

## פקודות עיקריות

| פקודה | תיאור |
|---|---|
| `/task <טקסט>` | הוספת משימה |
| `/tasks` | רשימת משימות |
| `/done <מספר>` | סימון משימה כבוצעה |
| `/remind in 30m <טקסט>` | תזכורת יחסית |
| `/remind 2026-07-25 18:30 <טקסט>` | תזכורת לזמן מסוים |
| `/reminders` | רשימת תזכורות ממתינות |
| `/cancel <מספר>` | ביטול תזכורת |
| `/note <טקסט>` | שמירת פתק |
| `/notes` | רשימת פתקים |
| `/delnote <מספר>` | מחיקת פתק |
| `/expense <סכום> <קטגוריה> [תיאור]` | רישום הוצאה |
| `/expenses [today\|week\|month\|all]` | סיכום הוצאות |
| `/delexpense <מספר>` | מחיקת הוצאה |
| `/reset` | איפוס הקשר הצ'אט החכם |
| `/help` | רשימת כל הפקודות |

כל הודעת טקסט חופשית (שאינה פקודה) נשלחת אוטומטית לצ'אט החכם.

## אחסון נתונים

הנתונים נשמרים בקובץ JSON – בברירת מחדל `data/db.json`, וניתן לשנות את הנתיב עם משתנה
הסביבה `DB_PATH` (רלוונטי בפריסה עם דיסק קבוע, ראו למטה). לגיבוי – פשוט להעתיק את הקובץ.

## פריסה ל-Render

בריפו יש כבר קובץ `render.yaml` (ב-root של הפרויקט) שמגדיר **Background Worker** עם
דיסק קבוע לשמירת הנתונים בין דיפלויים.

1. יצירת בוט חדש ב-[@BotFather](https://t.me/BotFather) וקבלת `TELEGRAM_BOT_TOKEN`.
   (אופציונלי) מפתח API מ-[console.anthropic.com](https://console.anthropic.com) לצ'אט החכם.
2. ב-[Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**, ולחבר את
   ריפו ה-GitHub הזה. Render יזהה את `render.yaml` אוטומטית.
3. Render יבקש למלא את משתני הסביבה `TELEGRAM_BOT_TOKEN` ו-`ANTHROPIC_API_KEY` (הם מוגדרים
   כ-`sync: false` כדי שלא יישמרו בקוד) – למלא אותם בדשבורד.
4. אישור היצירה. Render יבנה (`npm install`) ויפעיל (`npm start`) את הבוט כ-Worker שרץ
   ברציפות (לא נכנס לשינה כמו Web Service בחינמי).

**חשוב לגבי עלות:** שירות מסוג Background Worker על Render דורש תוכנית בתשלום (Starter,
כ-7$/חודש) – אין להם אפשרות Worker בטוכנית החינמית. הדיסק הקבוע (1GB, מוגדר ב-`render.yaml`)
מתומחר בנפרד (כ-0.25$ ל-GB בחודש) ומחובר בנתיב `/var/data`, כדי שהתזכורות/משימות/פתקים/הוצאות
לא יימחקו בכל דיפלוי מחדש.

אם מעדיפים בלי דיסק (ולוותר על שמירת נתונים בין דיפלויים) – אפשר להסיר את מקטע `disk` ואת
`DB_PATH` מ-`render.yaml`.

### פריסה ידנית (בלי Blueprint)

אפשר גם ליצור **New → Background Worker** ידנית בדשבורד ולהגדיר: Root Directory =
`telegram-assistant`, Build Command = `npm install`, Start Command = `npm start`, ולהוסיף
את משתני הסביבה ידנית.
