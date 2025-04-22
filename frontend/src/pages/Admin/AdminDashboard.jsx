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
        background: 'transparent',
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
        },
      },
      tooltip: {
        theme: 'dark',
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
        },
      },
      colors: ['rgb(211, 190, 249)'],
      dataLabels: {
        enabled: true,
        style: {
          colors: ['#fff'],
          fontWeight: 'bold',
        },
        background: {
          enabled: true,
          foreColor: 'rgb(7, 10, 19)',
          borderRadius: 2,
          padding: 4,
          opacity: 0.9,
          borderWidth: 1,
          borderColor: 'rgb(211, 190, 249)',
        },
      },
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      title: {
        text: 'Sales Trend',
        align: 'left',
        style: {
          color: '#fff',
          fontSize: '18px',
          fontWeight: '600',
        },
      },
      grid: {
        borderColor: 'rgba(211, 190, 249, 0.1)',
        strokeDashArray: 5,
        xaxis: {
          lines: {
            show: true
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        },
      },
      markers: {
        size: 5,
        colors: ['rgb(211, 190, 249)'],
        strokeColors: 'rgb(7, 10, 19)',
        strokeWidth: 2,
        hover: {
          size: 7,
        }
      },
      xaxis: {
        categories: [],
        title: {
          text: 'Date',
          style: {
            color: '#fff',
            fontSize: '14px',
          },
        },
        labels: {
          style: {
            colors: '#fff',
          },
        },
        axisBorder: {
          show: true,
          color: 'rgba(211, 190, 249, 0.3)',
        },
        axisTicks: {
          show: true,
          color: 'rgba(211, 190, 249, 0.3)',
        },
      },
      yaxis: {
        title: {
          text: 'Sales',
          style: {
            color: '#fff',
            fontSize: '14px',
          },
        },
        min: 0,
        labels: {
          style: {
            colors: '#fff',
          },
          formatter: (value) => `$${value.toFixed(0)}`,
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        floating: true,
        offsetY: -25,
        offsetX: -5,
        labels: {
          colors: ['#fff'],
        },
        markers: {
          fillColors: ['rgb(211, 190, 249)'],
        }
      },
      theme: {
        mode: 'dark',
      }
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
            ...prevState.options.xaxis,
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
      <section className="min-h-screen" style={{ backgroundColor: 'rgb(7, 10, 19)', color: '#fff' }}>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-center border-b border-opacity-20" style={{ borderColor: 'rgb(211, 190, 249)', paddingBottom: '1rem' }}>
            Admin Dashboard
          </h1>
          
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {/* Sales Card */}
            <div className="flex-1 min-w-64 max-w-80 rounded-lg p-6 backdrop-blur-sm" 
                 style={{ backgroundColor: 'rgba(23, 27, 40, 0.8)', borderLeft: '4px solid rgb(211, 190, 249)' }}>
              <div className="flex items-center mb-4">
                <div className="rounded-full p-3 mr-4" style={{ backgroundColor: 'rgba(211, 190, 249, 0.2)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="rgb(211, 190, 249)">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">Total Sales</p>
                  <h2 className="text-2xl font-bold">
                    {loadingSales ? (
                      <Loader />
                    ) : (
                      `$${Number(sales?.totalSales || 0).toFixed(2)}`
                    )}
                  </h2>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-700 mt-4">
                <div className="h-full rounded-full" style={{ width: '70%', backgroundColor: 'rgb(211, 190, 249)' }}></div>
              </div>
            </div>

            {/* Customers Card */}
            <div className="flex-1 min-w-64 max-w-80 rounded-lg p-6 backdrop-blur-sm" 
                 style={{ backgroundColor: 'rgba(23, 27, 40, 0.8)', borderLeft: '4px solid rgb(211, 190, 249)' }}>
              <div className="flex items-center mb-4">
                <div className="rounded-full p-3 mr-4" style={{ backgroundColor: 'rgba(211, 190, 249, 0.2)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="rgb(211, 190, 249)">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">Total Customers</p>
                  <h2 className="text-2xl font-bold">
                    {loadingCustomers ? <Loader /> : customers?.length ?? 0}
                  </h2>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-700 mt-4">
                <div className="h-full rounded-full" style={{ width: '60%', backgroundColor: 'rgb(211, 190, 249)' }}></div>
              </div>
            </div>

            {/* Orders Card */}
            <div className="flex-1 min-w-64 max-w-80 rounded-lg p-6 backdrop-blur-sm" 
                 style={{ backgroundColor: 'rgba(23, 27, 40, 0.8)', borderLeft: '4px solid rgb(211, 190, 249)' }}>
              <div className="flex items-center mb-4">
                <div className="rounded-full p-3 mr-4" style={{ backgroundColor: 'rgba(211, 190, 249, 0.2)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="rgb(211, 190, 249)">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">Total Orders</p>
                  <h2 className="text-2xl font-bold">
                    {loadingOrders ? <Loader /> : orders?.totalOrders ?? 0}
                  </h2>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-700 mt-4">
                <div className="h-full rounded-full" style={{ width: '80%', backgroundColor: 'rgb(211, 190, 249)' }}></div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="mb-12 p-6 rounded-lg" style={{ backgroundColor: 'rgba(23, 27, 40, 0.8)' }}>
            <Chart
              options={state.options}
              series={state.series}
              type='line'
              height={400}
              width="100%"
            />
          </div>

          {/* Order List Section */}
          <div className="p-6 rounded-lg" style={{ backgroundColor: 'rgba(23, 27, 40, 0.8)' }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'rgb(211, 190, 249)' }}>Recent Orders</h2>
            <OrderList />
          </div>
        </div>
      </section>
    </>
  )
}

export default AdminDashboard