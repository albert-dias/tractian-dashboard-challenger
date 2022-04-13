/* eslint-disable @typescript-eslint/comma-dangle */
/* eslint-disable multiline-ternary */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
	Box,
	Button,
	Checkbox,
	Flex,
	Heading,
	Icon,
	Spinner,
	Table,
	Tbody,
	Td,
	Text,
	Th,
	Thead,
	Tr,
	useBreakpointValue,
	Link as ChakraLink,
} from "@chakra-ui/react";
import { useState } from "react";
import { RiAddLine, RiPencilLine } from "react-icons/ri";

import { HeadTitle } from "web/components/HeadTitle";
import { NextLink } from "web/components/NextLink";
import { Pagination } from "web/components/Pagination";

import { ConfirmDeleteDialog } from "../../components/ConfirmDeleteDialog";

import { useAssets } from "services/hooks/useAssets";

import type { FCWithLayout } from "types/interfaces/layout";

import { api } from "../../../services/api";
import { queryClient } from "../../../services/queryClient";

const TEN_MINUTES_IN_MILLISECONDS = 1000 * 60 * 10; //10 minutes;

export const AssetList: FCWithLayout = () => {
	const [page, setPage] = useState(1);
	const { data, isLoading, error, isFetching, refetch } = useAssets(page);

	const isWideVersion = useBreakpointValue({
		base: false,
		lg: true,
	});

	const handlePrefetchAsset = async (assetId: string) => {
		await queryClient.prefetchQuery(
			["asset", { assetId }],
			async () => {
				const res = await api.get(`assets/${assetId}`);
				console.log(res.data);

				return res.data;
			},
			{
				staleTime: TEN_MINUTES_IN_MILLISECONDS,
				// eslint-disable-next-line prettier/prettier
			}
		);
	};

	return (
		<>
			<HeadTitle title="Assets" />
			<Box flex="1" borderRadius="8" bg="gray.800" p="8">
				<Flex mb="8" justify="space-between" align="center">
					<Heading size="lg" fontWeight="normal">
						Assets
						{!isLoading && isFetching && (
							<Spinner size="sm" color="gray.500" ml="4" />
						)}
					</Heading>

					<NextLink href="/assets/create">
						<Button
							as="button"
							size="sm"
							fontSize="sm"
							colorScheme="pink"
							leftIcon={<Icon as={RiAddLine} fontSize="20" />}
						>
							Add new
						</Button>
					</NextLink>
				</Flex>

				{isLoading ? (
					<Flex align="center" justify="center">
						<Spinner />
					</Flex>
				) : error ? (
					<Flex align="center" justify="center">
						Data error
					</Flex>
				) : (
					<>
						<Table colorScheme="whiteAlpha">
							<Thead>
								<Tr>
									<Th px={["4", "4", "6"]} color="gray.300" w="32">
										<Checkbox colorScheme="pink" />
									</Th>
									<Th>Assets</Th>
									{isWideVersion && <Th w="8"></Th>}
								</Tr>
							</Thead>
							<Tbody>
								{data?.assets.map(({ id, name }) => (
									<Tr key={id}>
										<Td px={["4", "4", "6"]}>
											<Checkbox colorScheme="pink" />
										</Td>
										<Td>
											<Box>
												<Text color="purple.400" fontWeight="bold">
													<ChakraLink
														onMouseEnter={() => handlePrefetchAsset(id)}
													>
														{name}
													</ChakraLink>
												</Text>
											</Box>
										</Td>
										{isWideVersion && (
											<Td>
												<Flex align="center" justify="center" gap="4">
													<NextLink href={`/assets/edit/${id}`}>
														<Button
															as="button"
															size="sm"
															fontSize="sm"
															colorScheme="purple"
															cursor="pointer"
															aria-label="Edit user"
														>
															<Icon as={RiPencilLine} fontSize="16" />
														</Button>
													</NextLink>

													<ConfirmDeleteDialog
														id={id}
														refetch={refetch}
														deletePath="assets"
														headerMessage="asset"
													/>
												</Flex>
											</Td>
										)}
									</Tr>
								))}
							</Tbody>
						</Table>
						<Pagination
							totalCountOfRegisters={Number(data?.totalCount)}
							currentPage={page}
							onPageChange={setPage}
						/>
					</>
				)}
			</Box>
		</>
	);
};
