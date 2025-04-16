"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react"

// 定义游戏常量
const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SPEED = 150

// 方向枚举
enum Direction {
  UP = 0,
  RIGHT = 1,
  DOWN = 2,
  LEFT = 3,
}

// 坐标类型
type Position = {
  x: number
  y: number
}

export default function SnakeGame() {
  // 游戏状态
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }])
  const [food, setFood] = useState<Position>({ x: 5, y: 5 })
  const [direction, setDirection] = useState<Direction>(Direction.RIGHT)
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [score, setScore] = useState<number>(0)
  const [isPaused, setIsPaused] = useState<boolean>(true)
  const [speed, setSpeed] = useState<number>(INITIAL_SPEED)

  // 生成随机食物位置
  const generateFood = useCallback((): Position => {
    const x = Math.floor(Math.random() * GRID_SIZE)
    const y = Math.floor(Math.random() * GRID_SIZE)
    return { x, y }
  }, [])

  // 检查位置是否与蛇身重叠
  const isPositionOccupied = useCallback(
    (pos: Position): boolean => {
      return snake.some((segment) => segment.x === pos.x && segment.y === pos.y)
    },
    [snake],
  )

  // 重置游戏
  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }])
    setFood(generateFood())
    setDirection(Direction.RIGHT)
    setGameOver(false)
    setScore(0)
    setSpeed(INITIAL_SPEED)
    setIsPaused(true)
  }, [generateFood])

  // 处理键盘输入
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return

      switch (e.key) {
        case "ArrowUp":
          if (direction !== Direction.DOWN) {
            setDirection(Direction.UP)
          }
          break
        case "ArrowRight":
          if (direction !== Direction.LEFT) {
            setDirection(Direction.RIGHT)
          }
          break
        case "ArrowDown":
          if (direction !== Direction.UP) {
            setDirection(Direction.DOWN)
          }
          break
        case "ArrowLeft":
          if (direction !== Direction.RIGHT) {
            setDirection(Direction.LEFT)
          }
          break
        case " ": // 空格键暂停/继续
          setIsPaused((prev) => !prev)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [direction, gameOver])

  // 游戏主循环
  useEffect(() => {
    if (isPaused || gameOver) return

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] }

        // 根据方向移动蛇头
        switch (direction) {
          case Direction.UP:
            head.y -= 1
            break
          case Direction.RIGHT:
            head.x += 1
            break
          case Direction.DOWN:
            head.y += 1
            break
          case Direction.LEFT:
            head.x -= 1
            break
        }

        // 检查是否撞墙
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true)
          return prevSnake
        }

        // 检查是否撞到自己
        if (prevSnake.some((segment, index) => index !== 0 && segment.x === head.x && segment.y === head.y)) {
          setGameOver(true)
          return prevSnake
        }

        const newSnake = [head, ...prevSnake]

        // 检查是否吃到食物
        if (head.x === food.x && head.y === food.y) {
          setScore((prev) => prev + 1)

          // 每5分加速
          if ((score + 1) % 5 === 0 && speed > 50) {
            setSpeed((prev) => prev - 10)
          }

          // 生成新食物
          let newFood
          do {
            newFood = generateFood()
          } while (isPositionOccupied(newFood))
          setFood(newFood)
        } else {
          // 如果没吃到食物，移除尾部
          newSnake.pop()
        }

        return newSnake
      })
    }

    const gameInterval = setInterval(moveSnake, speed)
    return () => clearInterval(gameInterval)
  }, [direction, food, gameOver, generateFood, isPaused, isPositionOccupied, score, speed])

  // 初始化食物
  useEffect(() => {
    setFood(generateFood())
  }, [generateFood])

  // 方向控制按钮处理函数
  const handleDirectionButton = (newDirection: Direction) => {
    if (gameOver) return

    // 防止反向移动
    if (
      (newDirection === Direction.UP && direction !== Direction.DOWN) ||
      (newDirection === Direction.RIGHT && direction !== Direction.LEFT) ||
      (newDirection === Direction.DOWN && direction !== Direction.UP) ||
      (newDirection === Direction.LEFT && direction !== Direction.RIGHT)
    ) {
      setDirection(newDirection)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>贪吃蛇游戏</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="mb-4 flex justify-between w-full">
            <div>得分: {score}</div>
            <div>
              {gameOver ? (
                <span className="text-red-500 font-bold">游戏结束!</span>
              ) : isPaused ? (
                <span className="text-yellow-500">已暂停</span>
              ) : (
                <span className="text-green-500">游戏中</span>
              )}
            </div>
          </div>

          {/* 游戏区域 */}
          <div
            className="relative border-2 border-gray-300"
            style={{
              width: GRID_SIZE * CELL_SIZE,
              height: GRID_SIZE * CELL_SIZE,
              backgroundColor: "#f0f0f0",
            }}
          >
            {/* 蛇 */}
            {snake.map((segment, index) => (
              <div
                key={index}
                className={`absolute ${index === 0 ? "bg-green-600" : "bg-green-400"} border border-green-800`}
                style={{
                  left: segment.x * CELL_SIZE,
                  top: segment.y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  borderRadius: index === 0 ? "4px" : "0",
                }}
              />
            ))}

            {/* 食物 */}
            <div
              className="absolute bg-red-500 rounded-full"
              style={{
                left: food.x * CELL_SIZE,
                top: food.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
              }}
            />
          </div>

          {/* 移动端方向控制 */}
          <div className="mt-6 grid grid-cols-3 gap-2 w-36">
            <div></div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDirectionButton(Direction.UP)}
              className="aspect-square"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <div></div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDirectionButton(Direction.LEFT)}
              className="aspect-square"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDirectionButton(Direction.DOWN)}
              className="aspect-square"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDirectionButton(Direction.RIGHT)}
              className="aspect-square"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button onClick={() => setIsPaused(!isPaused)} disabled={gameOver}>
            {isPaused ? "开始" : "暂停"}
          </Button>
          <Button onClick={resetGame} variant="outline">
            重新开始
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8 text-center max-w-md">
        <h2 className="text-xl font-bold mb-2">游戏说明</h2>
        <ul className="text-left list-disc pl-5">
          <li>使用键盘方向键或屏幕上的按钮控制蛇的移动</li>
          <li>吃到红色食物可以增加分数</li>
          <li>撞到墙壁或自己的身体游戏结束</li>
          <li>按空格键可以暂停/继续游戏</li>
          <li>每得5分，蛇的移动速度会加快</li>
        </ul>
      </div>
    </div>
  )
}
