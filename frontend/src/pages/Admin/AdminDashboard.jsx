import Chart from 'react-apexcharts'
import { useGetUsersQuery } from '../../redux/api/usersApiSlice'
import {
  useGetTotalOrdersQuery,
  useGetTotalSalesByDateQuery,
  useGetTotalSalesQuery,
} from '../../redux/api/orderApiSlice'

import { useState, useEffect } from 'react'
import OrderList from './OrderList'
import Loader from '../../components/Loader'

const AdminDashboard = () => {
  const { data: sales, isLoading: loadingSales } = useGetTotalSalesQuery()
  const { data: customers, isLoading: loadingCustomers } = useGetUsersQuery()
  const { data: orders, isLoading: loadingOrders } = useGetTotalOrdersQuery()
  const { data: salesDetail } = useGetTotalSalesByDateQuery()

  const [state, setState] = useState({
    options: {
      chart: {
        type: 'line',
      },
      tooltip: {
        theme: 'dark',
      },
      colors: ['#7f8c8d'],
      dataLabels: {
        enabled: true,
        style: {
          colors: ['#2c3e50'],
        },
      },
      stroke: {
        curve: 'smooth',
      },
      title: {
        text: 'Sales Trend',
        align: 'left',
        style: {
          color: '#2c3e50',
        },
      },
      grid: {
        borderColor: '#dcdcdc',
      },
      markers: {
        size: 4,
        colors: ['#2c3e50'],
      },
      xaxis: {
        categories: [],
        title: {
          text: 'Date',
          style: {
            color: '#2c3e50',
          },
        },
      },
      yaxis: {
        title: {
          text: 'Sales',
          style: {
            color: '#2c3e50',
          },
        },
        min: 0,
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        floating: true,
        offsetY: -25,
        offsetX: -5,
        labels: {
          colors: ['#2c3e50'],
        },
      },
    },
    series: [{ name: 'Sales', data: [] }],
  })

  useEffect(() => {
    if (salesDetail) {
      const formattedSalesDate = salesDetail.map((item) => ({
        x: item._id,
        y: item.totalSales,
      }))

      setState((prevState) => ({
        ...prevState,
        options: {
          ...prevState.options,
          xaxis: {
            categories: formattedSalesDate.map((item) => item.x),
          },
        },
        series: [
          { name: 'Sales', data: formattedSalesDate.map((item) => item.y) },
        ],
      }))
    }
  }, [salesDetail])

  return (
    <>
      <section className='xl:ml-[4rem] md:ml-[0rem] bg-white text-gray-800'>
        <div className='w-[80%] flex justify-around flex-wrap'>
          <div className='rounded-lg bg-gray-100 p-5 w-[20rem] mt-5'>
            <div className='font-bold rounded-full w-[3rem] bg-gray-300 text-center p-3'>
              $
            </div>
            <p className='mt-5 text-gray-600'>Sales</p>
            <h1 className='text-xl font-bold text-gray-800'>
              ${' '}
              {loadingSales ? (
                <Loader />
              ) : (
                Number(sales?.totalSales || 0).toFixed(2)
              )}
            </h1>
          </div>
          <div className='rounded-lg bg-gray-100 p-5 w-[20rem] mt-5'>
            <div className='font-bold rounded-full w-[3rem] bg-gray-300 text-center p-3'>
              $
            </div>
            <p className='mt-5 text-gray-600'>Customers</p>
            <h1 className='text-xl font-bold text-gray-800'>
              {loadingCustomers ? <Loader /> : customers?.length ?? 0}
            </h1>
          </div>
          <div className='rounded-lg bg-gray-100 p-5 w-[20rem] mt-5'>
            <div className='font-bold rounded-full w-[3rem] bg-gray-300 text-center p-3'>
              $
            </div>
            <p className='mt-5 text-gray-600'>All Orders</p>
            <h1 className='text-xl font-bold text-gray-800'>
              {loadingOrders ? <Loader /> : orders?.totalOrders ?? 0}
            </h1>
          </div>
        </div>

        <div className='ml-[10rem] mt-[4rem]'>
          <Chart
            options={state.options}
            series={state.series}
            type='line'
            width='70%'
          />
        </div>

        <div className='mt-[4rem]'>
          <OrderList />
        </div>
      </section>
    </>
  )
}

export default AdminDashboard
