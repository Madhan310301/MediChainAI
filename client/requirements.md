## Packages
framer-motion | For smooth animations and popup effects
lucide-react | Beautiful icons for healthcare UI
recharts | For visualizing health metrics and data
clsx | For conditional class names
tailwind-merge | For merging tailwind classes safely
react-i18next | For handling translations (even if mocked initially)
i18next | Core translation library
date-fns | For date formatting in charts/logs

## Notes
- The app requires a robust language selection modal on first load.
- AI Chat uses the integration routes at `/api/conversations` and `/api/conversations/:id/messages`.
- Streaming responses for chat need to be handled carefully (SSE).
- Visuals should be clean, high-contrast, and accessible.
