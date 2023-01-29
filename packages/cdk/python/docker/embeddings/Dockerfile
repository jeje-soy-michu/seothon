FROM python:3.11.1-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY src .

ENTRYPOINT [ "python", "./main.py" ]

CMD [ "--help" ]
