import { defineConfig } from 'tsup';
import { readFileSync, writeFileSync } from 'node:fs';

const addUseClient = {
  name: 'add-use-client',
  buildEnd(ctx) {
    for (const file of ctx.writtenFiles) {
      if (/index\.(js|mjs)$/.test(file.name)) {
        const content = readFileSync(file.name, 'utf8');
        if (!content.startsWith('"use client"')) {
          writeFileSync(file.name, `"use client";\n${content}`);
        }
      }
    }
  },
};

export default defineConfig({
  entry: ['src/index.ts'], // 진입점
  format: ['esm', 'cjs'], // ESM + CommonJS 둘 다 (범용성)
  dts: true, // .d.ts 타입 선언 자동 생성
  sourcemap: true, // 디버깅용 소스맵
  clean: true, // 빌드 전 dist 비우기
  treeshake: true, // 안 쓰는 코드 제거
  external: ['react', 'react-dom', 'jspdf', 'html2canvas-pro'],
  plugins: [addUseClient],
});
