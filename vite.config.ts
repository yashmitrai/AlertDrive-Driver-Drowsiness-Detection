import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 8080,
  },
  plugins: [react()],
  optimizeDeps: {
    include: [
      "@tensorflow/tfjs",
      "@tensorflow-models/face-landmarks-detection",
      "@mediapipe/face_mesh",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
