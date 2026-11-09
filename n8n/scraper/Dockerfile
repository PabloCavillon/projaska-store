FROM python:3.12-slim
RUN pip install --no-cache-dir "scrapling[fetchers]" fastapi uvicorn \
 && scrapling install
WORKDIR /app
COPY main.py .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
