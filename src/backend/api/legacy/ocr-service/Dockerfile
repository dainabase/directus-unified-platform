FROM node:18-bullseye

# Install système et Tesseract avec langues
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-fra \
    tesseract-ocr-deu \
    tesseract-ocr-ita \
    tesseract-ocr-eng \
    libtesseract-dev \
    imagemagick \
    ghostscript \
    poppler-utils \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Télécharger modèles haute qualité
RUN mkdir -p /usr/share/tesseract-ocr/5/tessdata && \
    cd /usr/share/tesseract-ocr/5/tessdata && \
    wget -q https://github.com/tesseract-ocr/tessdata_best/raw/main/fra.traineddata && \
    wget -q https://github.com/tesseract-ocr/tessdata_best/raw/main/eng.traineddata

# User non-root
RUN useradd -m -u 1001 ocruser

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --chown=ocruser:ocruser . .
RUN mkdir -p temp logs && chown -R ocruser:ocruser /app

USER ocruser

EXPOSE 3001

ENV NODE_ENV=production \
    PORT=3001 \
    TESSERACT_LANG=fra+eng+deu+ita \
    TESSDATA_PREFIX=/usr/share/tesseract-ocr/5/tessdata

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js || exit 1

CMD ["node", "src/server.js"]