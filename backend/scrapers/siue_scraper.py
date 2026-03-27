# SIUE Course Catalog Scraper
# See plan at .claude/plans/splendid-seeking-anchor.md for full implementation details

from bs4 import BeautifulSoup
import requests
import sys
import time
import re 
from dotenv import load_dotenv
# SIUE Course Catalog URLs
BASE_URL = "https://ssb.siue.edu/PROD"
ENTRY_URL = f"{BASE_URL}/bwckschd.p_disp_dyn_sched"
LISTING_URL = f"{BASE_URL}/bwckschd.p_get_crse_unsec"
DELAY = 1 # seconds
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; cougar-planner/1.0; +https://cougar-planner.com)"
}




