import json
import yfinance as yf
import tkinter
import matplotlib.pyplot as plt
import numpy as np

posts = []

with open("oasmia.json", "r") as file:
    posts = json.load(file)

stock_data = yf.download(
    tickers="OASM.ST",
    period="1mo",
    interval="15m"
)

# plt.plot(stock_data.Open, "r-")

# plt.show()


# Create some mock data
price = stock_data.Open
vol = stock_data.Volume


fig, ax1 = plt.subplots()

color = 'tab:red'
ax1.set_xlabel('timestamp')
ax1.set_ylabel('Price', color=color)
ax1.plot(price, color=color)
ax1.tick_params(axis='y', labelcolor=color)

ax2 = ax1.twinx()  # instantiate a second axes that shares the same x-axis


# color = 'tab:blue'
# ax2.set_ylabel('Volume', color=color)
# ax2.plot(vol, color=color)
# ax2.tick_params(axis='y', labelcolor=color)

fig.tight_layout()  # otherwise the right y-label is slightly clipped
plt.show()
