import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import time as tm
import json


class Scraper(object):
    def __init__(self, url, filename, pageLimit=None):
        self.url = url
        self.pageLimit = pageLimit
        self.filename = filename

    def getTimestamp(self, post):
        children = post.find("div", {"class": "userPostHeader"}).findChildren()
        date = children[0].text
        if(date == 'idag'):
            date = datetime.today().strftime("%Y-%m-%d")
        if(date == 'igår'):
            date = datetime.today() - timedelta(days=1)
            date = date.strftime("%Y-%m-%d")

        time = children[1].text
        return datetime.strptime(date+time, '%Y-%m-%d%H:%M')

    def scrape(self):
        # First request to get number of pages:
        soup = BeautifulSoup(requests.get(self.url).text, features="lxml")

        # Find number of pages:
        size = soup.find("div", {"class": "forumTableFooter"}
                         ).findChildren()[0].find("span").text.split("/")[1]

        if self.pageLimit != None:
            size = self.pageLimit

        allPosts = []

        for i in range(int(size)):
            new_url = self.url[:-4] + str(i*15) + ".html"
            soup = BeautifulSoup(requests.get(new_url).text, features="lxml")
            posts = soup.findAll("div", {"class": "forumBoxSplitter"})
            for post in posts:

                leftPanel = post.find("div", {"class": "forumUserDetails"})
                if(leftPanel == None):
                    continue

                author = leftPanel.find("a").text
                timestamp = str(self.getTimestamp(post))
                text = post.find("div", {"class": "forumPostText"}).text

                allPosts.append(
                    {"author": author, "text": text, "timestamp": timestamp})

        with open(self.filename, "w") as f:
            f.write(json.dumps(allPosts))
