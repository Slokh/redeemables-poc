import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import { Box, Button, Flex, Image, Stack, Text } from "@chakra-ui/react";
import { useAccount, useSignMessage } from "wagmi";
import { useEffect, useState } from "react";

type Auth = {
  requirements: [
    {
      name: string;
      token: string;
      identifier: number;
    }
  ];
  message: string;
  connected: boolean;
  error: boolean;
};

const Home: NextPage = () => {
  const [auth, setAuth] = useState<Auth>();
  const [child, setChild] = useState<MessageEventSource>();
  const { signMessage } = useSignMessage({
    onSuccess(data) {
      // Verify signature when sign message succeeds
      child?.postMessage({
        type: "web3-auth-response",
        data: { signature: data },
      });
    },
  });

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type !== "web3-auth-request") {
      return;
    }

    if (event.source) {
      setChild(event.source);
    }

    setAuth(event.data.data.auth);
  };

  const handleClick = () => {
    if (!auth?.message) {
      return;
    }

    signMessage({
      message: auth?.message,
    });
  };

  return (
    <Stack p={16} justify="center" align="center" w="full" h="full" spacing={8}>
      <ConnectButton />
      <Flex border="1px solid black" w="2xl" h="2xl">
        {auth && !auth.connected && (
          <Flex
            position="absolute"
            bgColor="rgba(0, 0, 0, 0.5)"
            w="2xl"
            h="2xl"
            justify="center"
            align="center"
          >
            <Stack
              bgColor="white"
              borderRadius={4}
              p={4}
              justify="center"
              align="center"
            >
              <Text>
                You must own <strong>{auth?.requirements[0].name}</strong> to
                access this content.
              </Text>
              <Image
                boxSize={32}
                alt="image"
                src="https://i.seadn.io/gae/2dDlrvU-x-FQGKdGO2wWZ2P6Eyu6-fdgNlqLhXKcNWOP92qWIJ6j4aeGhMrzeddUhtsKMvU1sUzSrSwNQHe-OQPg75YZD-Dl5Rf0JA?auto=format&w=140"
              />
              {auth?.error ? (
                <Text color="red">Invalid authentication</Text>
              ) : (
                <Button onClick={handleClick}>Verify Ownership</Button>
              )}
            </Stack>
          </Flex>
        )}
        <iframe
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-scripts allow-same-origin"
          src="http://localhost:3000/iframe"
          width="100%"
          height="100%"
        />
      </Flex>
    </Stack>
  );
};

export default Home;
