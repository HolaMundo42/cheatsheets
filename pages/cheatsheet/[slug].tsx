import fs from "fs";
import matter from "gray-matter";
import path from "path";
import Head from "next/head";
import "highlight.js/styles/github-dark.css";
import React, { useContext } from "react";
import FloatingButton from "../../components/utils/FloatingButton";
import Arrow, { ArrowDirection } from "../../components/utils/Arrow";
import { LoadingContext } from "../../contexts/LoadingContext";
import { ThemeContext } from "../../contexts/ThemeContext";
import router from "next/router";
import hljs from "highlight.js";
import marked from "marked-katex";
import katex from "katex";

marked.setOptions({
    highlight: function (code, lang) {
        if (typeof lang === "undefined") {
            return hljs.highlightAuto(code).value;
        } else if (lang === "nohighlight") {
            return code;
        } else {
            return hljs.highlight(lang, code).value;
        }
    },
    kaTex: katex,
});

type CheatsheetPageProps = {
    frontmatter: {
        title: string;
        image: string;
    };
    content: string;
};

const CheatsheetPage = ({
    frontmatter: { title, image },
    content,
}: CheatsheetPageProps) => {
    const { setLoading } = useContext(LoadingContext);
    const { theme } = useContext(ThemeContext);

    router.events.on("routeChangeStart", () => setLoading(true));
    router.events.on("routeChangeComplete", () => setLoading(false));

    return (
        <>
            <Head>
                <title>{title}</title>
            </Head>
            <div className={["doc", theme].join(" ")}>
                <h1>{title}</h1>
                <div
                    className="cheatsheet"
                    dangerouslySetInnerHTML={{
                        __html: marked(content),
                    }}
                />
            </div>
            <FloatingButton onClick={() => window.scrollTo(0, 0)}>
                <Arrow direction={ArrowDirection.up} />
            </FloatingButton>
        </>
    );
};

export const getStaticPaths = async () => {
    const files = fs.readdirSync(path.join("cheatsheets"));

    const paths = files
        .map((file) => {
            const slug = file.replace(".md", "");

            return {
                params: {
                    slug,
                },
            };
        })
        .filter((p) => p.params.slug !== "index");

    return {
        paths,
        fallback: false,
    };
};

export const getStaticProps = async ({ params: { slug } }) => {
    const markdownWithMeta = fs.readFileSync(
        path.join("cheatsheets", `${slug}.md`),
        "utf8"
    );

    const { data: frontmatter, content } = matter(markdownWithMeta);

    return {
        props: {
            frontmatter,
            content,
        } as CheatsheetPageProps,
    };
};

export default CheatsheetPage;
