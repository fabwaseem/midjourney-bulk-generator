import axios from "axios";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

const extractTitles = (data: any) => {
  const titles: string[] = [];
  const traverse = (obj: any) => {
    if (typeof obj === "object") {
      for (const key in obj) {
        if (key === "title" && typeof obj[key] === "string") {
          titles.push(obj[key]);
        }
        traverse(obj[key]);
      }
    }
  };
  traverse(data);
  return titles;
};

export async function POST(req: Request) {
  try {
    const formData = await req.json();
    let url = "";

    if (formData.query.includes("http")) {
      url = formData.query;
      if (url.includes("search_page")) {
        url = url.replace(/search_page=\d+/, `search_page=${formData.page}`);
      } else {
        url = `${url}&search_page=${formData.page}`;
      }
    } else {
      const searchUrl = `https://stock.adobe.com/search/images?filters%5Bcontent_type%3Aphoto%5D=1&filters%5Bcontent_type%3Aillustration%5D=0&filters%5Bcontent_type%3Azip_vector%5D=0&filters%5Bcontent_type%3Avideo%5D=0&filters%5Bcontent_type%3Atemplate%5D=0&filters%5Bcontent_type%3A3d%5D=0&filters%5Bcontent_type%3Aaudio%5D=0&filters%5Bcontent_type%3Aimage%5D=1&filters%5Boffensive%3A2%5D=1&filters%5Binclude_stock_enterprise%5D=0&filters%5Bis_editorial%5D=0&k=${formData.query}&order=relevance&safe_search=0&search_type=pagination&limit=100&search_page=${formData.page}&get_facets=0`;
      url = searchUrl;
    }

    const response = await axios.get(url);
    //  load in cheerio
    const $ = cheerio.load(response.data);
    const scriptTag = $("#image-detail-json").text();


    const data = JSON.parse(scriptTag || "{}");
    const titles = extractTitles(data);

    // Filter titles which are shorter than 3 words
    const filteredTitles = titles.filter(
      (title: string, index: number, self: string[]) =>
        self.indexOf(title) === index && title.split(" ").length > 3
    );

    if (!filteredTitles.length) {
      return NextResponse.json(
        { error: "No valid titles found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ titles: filteredTitles });
  } catch (error) {
    console.error("Error fetching titles:", error);
    return NextResponse.json(
      { error: "Failed to fetch titles" },
      { status: 500 }
    );
  }
}
