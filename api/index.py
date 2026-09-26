import sys
import os

# Adiciona a raiz do projeto ao sys.path para importar o script.py
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from script import app

# Exporta app como WSGI entrypoint da Vercel Serverless Function
if __name__ == "__main__":
    app.run()
