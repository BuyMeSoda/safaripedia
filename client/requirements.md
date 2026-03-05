## Packages
framer-motion | Smooth entry animations and micro-interactions for a premium feel
lucide-react | Clean, consistent iconography
react-textarea-autosize | Auto-expanding textarea for a better writing experience

## Notes
The application requires a POST request to `/api/generate` with `{ prompt }`.
It returns a standard JSON response `{ response }`, not a stream.
Using Framer Motion to create a staggered, smooth reveal for the result.
