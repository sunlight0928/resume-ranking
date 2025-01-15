import json
import os
import time
from datetime import datetime

import jsbeautifier
from langchain.schema import HumanMessage, SystemMessage
from langchain_community.document_loaders import PyPDFLoader
from langchain_openai import ChatOpenAI
from src.candidate.config import candidate_config
from src.candidate.prompts import fn_candidate_analysis, system_prompt_candidate
from src.utils import LOGGER
from docx import Document  # Importing python-docx


async def save_cv_candidate(file):
    # Prepend the current datetime to the filename
    file_name = datetime.now().strftime("%Y%m%d%H%M%S-") + file.filename

    # Construct the full file path based on the settings
    file_path = candidate_config.CV_UPLOAD_DIR + file_name

    # Read the contents of the uploaded file asynchronously
    contents = await file.read()

    # Write the uploaded contents to the specified file path
    with open(file_path, "wb") as f:
        f.write(contents)

    return file_name


def output2json(output):
    """GPT Output Object >>> JSON"""
    opts = jsbeautifier.default_options()
    return json.loads(jsbeautifier.beautify(output["function_call"]["arguments"], opts))


def load_pdf_docx(file_path):
    # Determine the file type and choose the appropriate loader
    if file_path.lower().endswith(".pdf"):
        loader = PyPDFLoader(file_path)
        documents = loader.load_and_split()
    elif file_path.lower().endswith(".docx"):
        # Use python-docx to load the .docx file
        documents = []
        doc = Document(file_path)
        
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():  # Skip empty paragraphs
                documents.append(paragraph.text)
    else:
        raise ValueError("Unsupported file format. Only .pdf and .docx are supported.")

    return documents


def read_cv_candidate(file_name):
    file_path = candidate_config.CV_UPLOAD_DIR + file_name

    # Load the document's content using the appropriate loader
    content = ""
    documents = load_pdf_docx(file_path=file_path)

    if isinstance(documents, list):  # For .docx, we return a list of paragraphs
        content = "\n".join(documents)
    else:  # For .pdf, we use the `page_content` attribute
        for page in documents:
            content += page.page_content

    return content


def analyse_candidate(cv_content):
    start = time.time()
    LOGGER.info("Start analysing candidate")

    llm = ChatOpenAI(model=candidate_config.MODEL_NAME, temperature=0.5)
    completion = llm.predict_messages(
        [
            SystemMessage(content=system_prompt_candidate),
            HumanMessage(content=cv_content),
        ],
        functions=fn_candidate_analysis,
    )

    output_analysis = completion.additional_kwargs
    json_output = output2json(output=output_analysis)

    LOGGER.info("Done analysing candidate")
    LOGGER.info(f"Time to analyse candidate: {time.time() - start}")

    return json_output