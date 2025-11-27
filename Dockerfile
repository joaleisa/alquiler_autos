FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY . .
#
#ENV PORT=8000
#
#EXPOSE 8000

CMD ["fastapi", "run", "backend/main.py", "--port", "8000", "--reload"]

#CMD ["uvicorn", "backend/main:app", "--port", "8000", "--reload"]
