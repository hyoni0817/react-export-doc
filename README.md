# react-export-doc

> A simple way to export React components as downloadable PDF files.

![npm](https://img.shields.io/npm/v/react-export-doc)
![license](https://img.shields.io/npm/l/react-export-doc)

`react-export-doc` lets you render normal React components and export them as a
multi-page, A4-sized PDF — with automatic page breaks, continuous page numbering,
and shared headers/footers.

## Features

- 🖨️ Export any React component to a downloadable PDF
- 📄 Automatic A4 page splitting (respects `break-inside: avoid`)
- 🔢 Continuous page numbering across multiple documents
- 🧩 Shared headers/footers via render props
- ⚛️ Works with React 18+ and Next.js App Router (ships with `"use client"`)

## Installation

```bash
npm install react-export-doc
```

`react` and `react-dom` (>=18) are peer dependencies, so make sure they are
installed in your project.

## Quick Start

### 1. Wrap your app with `ReactDocProvider`

```tsx
// app/layout.tsx (Next.js App Router)
import { ReactDocProvider } from 'react-export-doc';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ReactDocProvider>{children}</ReactDocProvider>
      </body>
    </html>
  );
}
```

### 2. Define the document you want to export

```tsx
import { Document, DocumentGroup } from 'react-export-doc';

export function MyDocument() {
  return (
    <DocumentGroup>
      <Document>
        <h1>Invoice</h1>
        <p>Thanks for your purchase!</p>
      </Document>
    </DocumentGroup>
  );
}
```

### 3. Trigger the export with `useExportDoc`

```tsx
'use client';

import { useExportDoc } from 'react-export-doc';
import { MyDocument } from './MyDocument';

export function ExportButton() {
  const { exportPDF } = useExportDoc();

  return <button onClick={() => exportPDF(<MyDocument />, { filename: 'invoice.pdf' })}>Export PDF</button>;
}
```

## API

### `<ReactDocProvider>`

Provides the export context. Must wrap any component that uses `useExportDoc`.

| Prop       | Type        | Description      |
| ---------- | ----------- | ---------------- |
| `children` | `ReactNode` | Your application |

### `useExportDoc()`

Returns an object with the export function. Must be used inside `ReactDocProvider`.

```ts
const { exportPDF } = useExportDoc();

exportPDF(component: ReactNode, options: { filename: string }): Promise<void>;
```

### `<DocumentGroup>`

Groups multiple `Document`s so their page numbers are continuous and lets you
apply shared headers/footers.

| Prop           | Type                                     | Description                  |
| -------------- | ---------------------------------------- | ---------------------------- |
| `children`     | `ReactNode`                              | One or more `<Document>`     |
| `renderHeader` | `(currentPage, totalPages) => ReactNode` | Header applied to every page |
| `renderFooter` | `(currentPage, totalPages) => ReactNode` | Footer applied to every page |

### `<Document>`

Renders content and automatically splits it into A4 pages.

| Prop           | Type                                     | Description                                                     |
| -------------- | ---------------------------------------- | --------------------------------------------------------------- |
| `children`     | `ReactNode`                              | The content to paginate                                         |
| `pageTopItems` | `ReactNode`                              | Element repeated at the top of every page (e.g. a table header) |
| `renderHeader` | `(currentPage, totalPages) => ReactNode` | Overrides the group header for this document                    |
| `renderFooter` | `(currentPage, totalPages) => ReactNode` | Overrides the group footer for this document                    |

### Helper components

`<Header title>` and `<Footer currentPage totalPages>` are optional presentational
components you can use inside `renderHeader` / `renderFooter`.

## Example

```tsx
<DocumentGroup
  renderHeader={(page, total) => <Header title="Monthly Report" currentPage={page} totalPages={total} />}
  renderFooter={(page, total) => <Footer currentPage={page} totalPages={total} />}
>
  <Document>{/* page 1..n */}</Document>
  <Document>{/* continues numbering */}</Document>
</DocumentGroup>
```

## Requirements

- React 18 or later
- A browser environment (PDF generation relies on the DOM via `html2canvas-pro` and `jsPDF`)

## License

MIT © [imadevfairy](https://github.com/hyoni0817)
