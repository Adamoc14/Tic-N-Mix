// Imports and Package Declarations
import { useEffect , useState } from "react"
import StripeCheckout from 'react-stripe-checkout'
import useRequest from "../../hooks/use-request"
import Router from 'next/router'

// Component Declaration
const OrderShow = ({order , currentUser}) => {

    const [timeLeft , setTimeLeft] = useState(0)
    const {doRequest , errors}  = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order?.id,
        },
        onSuccess: () => Router.push('/orders')
    })
    
    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order?.expiresAt) - new Date()
            setTimeLeft(Math.round(msLeft / 1000))
        }

        findTimeLeft();
        const timerId = setInterval(findTimeLeft , 1000)

        return () => {
            clearInterval(timerId)
        }

    }, [])

    return (
        <div>
            <h2>{order?.ticket?.title}</h2>
            {
                msLeft > 0 ? 
                <div> 
                    <h1>You have {timeLeft }s left to order</h1>
                    <StripeCheckout 
                        token= {({ id }) => doRequest({token: id})}
                        stripeKey = 'pk_test_51LsofqFgX3r1gNJJgf4PjbKdc8YTsK0PXo9I8ICNIik0HkSl67ZEgKByWl9wxfDPEdUThyTNFiWwzY3mXsfKs1za00cJuBPGmO'
                        amount= {order?.ticket?.price * 100}
                        email= {currentUser?.email}
                    />
                    {errors}
                </div>
                : <div>Order has expired</div>
            }
        </div>
    )
}

OrderShow.getInitialProps = async(context , client) => {
    const { orderId } = context?.query
    const {data:order} = await client.get(`/api/orders/${orderId}`)

    return {
        order
    }


}

// Exports
export default OrderShow