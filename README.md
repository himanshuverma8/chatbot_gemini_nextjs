
# 🤖 Gemini Chatbot – Project Documentation

A web application that allows users to upload a PDF, ask questions based on its contents, and get responses using Gemini API. Built with Next.js, Supabase, and Tailwind CSS.

---
## 📸 Screenshot

![Gemini Chat UI](https://res.cloudinary.com/de5vcnanx/image/upload/v1747870012/Screenshot_2025-05-22_at_4.53.28_AM_ordviq.png)

![Gemini Chat UI](https://res.cloudinary.com/de5vcnanx/image/upload/v1747870012/Screenshot_2025-05-22_at_4.53.32_AM_z7zypu.png)

## 📁 Project Structure

```
/app
  /api
    gemini.ts         # Handles Gemini API responses
    upload.ts         # Handles PDF file upload and parsing
  /chat
    page.tsx          # Main chat interface with authentication and file upload
/components
  ui/                 # Reusable UI components (Button, Input)
  toast-provider.tsx  # React Hot Toast setup
/utils
  supabase/client.ts  # Supabase client initialization
```

---

## 📦 Technologies Used

- **Next.js** – App routing and frontend logic
- **Supabase** – Authentication and database
- **React Hot Toast** – Notifications
- **Gemini API** – PDF-based LLM responses
- **Tailwind CSS + Shadcn UI** – Styling and UI components

---

## ⚙️ API Endpoints

### `POST /api/upload`

Uploads and parses a PDF.

#### Request

```http
Content-Type: multipart/form-data
```

#### Response

```json
{
  "text": "Extracted text from PDF"
}
```

---

### `POST /api/gemini`

Sends a message and PDF context to Gemini API.

#### Body

```json
{
  "message": "What is the summary?",
  "pdfText": "Full PDF text"
}
```

#### Response

```json
{
  "reply": "Gemini's reply based on the PDF content"
}
```

---

## 💬 Components Overview

### `ChatPage`

- Fetches user data
- Uploads PDF
- Sends queries to Gemini API
- Displays chat history
- Handles logout

### `toast-provider.tsx`

- Initializes Hot Toast with center placement

```tsx
<Toaster position="top-center" />
```

Include this in `layout.tsx`:

```tsx
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}
```

---

## ✅ Code Standards

- **JavaScript/TypeScript**: Follows ESLint rules via Next.js defaults.
- **Components**: Function-based, typed with `use client` directive.
- **Comments**: All major functions and logic are documented.
- **Styling**: Tailwind CSS utility classes, consistent with `shadcn/ui`.

---

## 📌 Example Commenting Style

```tsx
/**
 * Uploads a PDF, parses it, and sets extracted text
 */
const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  ...
}
```
