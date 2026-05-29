import ChatUI from './ChatUI'
import Header from './Header'
import History from './History'
import RecentExpenseDrawer from './RecentExpenseDrawer'
// import './App.css'


function App() {

  return (
    <>
    <Header/>
      <ChatUI />
      <RecentExpenseDrawer />
      <History />
    </>
  )
}

export default App
