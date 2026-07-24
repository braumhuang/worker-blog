import { Answer, Question } from "./partials/shared";
export function NotFound() {
  return (
    <>
      <Question variants={"咦，这条路好像走不通了？\n我是不是迷路了？"}>
        咦，这条路好像走不通了？
      </Question>
      <Answer intro="抱歉，这个页面像一封寄丢的信。">
        <div class="cg-404">
          <div>
            <div class="cg-404-num">404</div>
            <p>这里什么都没有，也许它搬家了，也许它从未存在过。</p>
            <a href="/">回到首页</a>
          </div>
        </div>
      </Answer>
    </>
  );
}
