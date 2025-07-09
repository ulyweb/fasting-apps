
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install flask bcrypt
CMD ["python", "app.py"]
