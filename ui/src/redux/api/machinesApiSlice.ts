import { createSelector, createEntityAdapter } from "@reduxjs/toolkit"
import { apiSlice } from "./apiSlice"

const machinesAdapter = createEntityAdapter({})

const initialState = machinesAdapter.getInitialState()

export const machinesApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getMachines: builder.query({
            query: () => ({
                url: '/machines',
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError
                },
            }),
            providesTags: (result: any) => {
                if (result?.ids) {
                    return [
                        { type: 'Machine', id: 'LIST' },
                        ...result.ids.map((id: any) => ({ type: 'Machine', id }))
                    ]
                } else return [{ type: 'Machine', id: 'LIST' }]
            }
        }),
        updateMachine: builder.mutation({
            query: initialMachine => ({
                url: `/machines/${initialMachine.id}`,
                method: 'PATCH',
                body: {
                    ...initialMachine,
                }
            }),
            invalidatesTags: (arg) => [
                { type: 'Machine', id: arg.id }
            ]
        }),
    }),
})

export const {
    useGetMachinesQuery,
    useUpdateMachineMutation,
} = machinesApiSlice

export const selectMachinesResult = machinesApiSlice.endpoints.getMachines.select((queryArg: any) => queryArg)

const selectMachinesData = createSelector(
    selectMachinesResult,
    machinesResult => machinesResult.data
)

export const {
    selectAll: selectAllMachines,
    selectById: selectMachineById,
    selectIds: selectMachineIds
} = machinesAdapter.getSelectors((state: any) => selectMachinesData(state) ?? initialState)
