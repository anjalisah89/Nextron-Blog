import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { getCategory, getCategoryPost } from "@/services";
import Loader from "@/components/Loader";
import Categories from "@/components/Categories";
import PostCard from "@/components/PostCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CategoryPost = ({ posts }) => {
  const router = useRouter();

  if (router.isFallback) {
    return <Loader />;
  }
  const { slug } = router.query;
  const categoryName = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  console.log("categoryName", categoryName);
  return (
    <>
      <Head>
        <title>{categoryName}</title>
        <meta
          name="description"
          content="Next Js Headless CMS GraphQL Blog App"
        />
        <link rel="icon" href="/image/logo.svg" type="image/svg+xml" />
      </Head>
      <Header />
      <div className="flex flex-col text-center w-full mb-5 mt-5">
        <h2 className="text-xs text-pink-500 tracking-widest font-medium title-font mb-1">
          Related Articles on
        </h2>
        <h1 className="sm:text-3xl text-2xl font-medium title-font text-gray-900">
          {categoryName}
        </h1>
      </div>
      <div className="container mx-auto lg:px-10 px-5 mt-4">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          <div className="col-span-1 lg:col-span-8">
            {posts.map((post, index) => (
              <PostCard key={index} post={post.node} />
            ))}
          </div>
          <div className="col-span-1 lg:col-span-4">
            <div className="relative lg:sticky top-8">
              <Categories />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
export default CategoryPost;

export async function getStaticProps({ params }) {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHCMS_ENDPOINT;

  if (!endpoint) {
    console.error("GraphCMS endpoint is not defined");
    return {
      props: {
        posts: [],
      },
    };
  }
  const client = new ApolloClient({
    uri: endpoint,
    cache: new InMemoryCache(),
  });

  try {
    const { data } = await client.query({
      query: getCategoryPost,
      variables: { slug: params.slug },
    });
    // console.log("data", data);

    return {
      props: {
        posts: data.postsConnection.edges ?? [],
      },
    };
  } catch (error) {
    console.error("Error in getStaticProps:", error.message);
    return {
      props: {
        posts: [],
        category: [],
      },
    };
  }
}
export async function getStaticPaths() {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHCMS_ENDPOINT;
  const client = new ApolloClient({
    uri: endpoint,
    cache: new InMemoryCache(),
  });

  try {
    const { data } = await client.query({ query: getCategory });
    const paths = data.categories.map(({ slug }) => ({
      params: { slug: slug },
    }));

    return {
      paths: paths,
      fallback: true,
    };
  } catch (error) {
    console.error("Error in getStaticPaths Check Endpoint:", error.message);
    return {
      paths: [],
      fallback: false,
    };
  }
}
