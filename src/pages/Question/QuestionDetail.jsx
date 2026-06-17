import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Spinner, Alert, Button } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { FaRobot } from "react-icons/fa";

import { fetchQuestionById } from "../../reducers/questionSlice.js";
import { summarizeAnswers } from "../../services/aiService.js";
import QuestionContent from "../../components/Question/QuestionContent.jsx";
import AnswerList from "../../components/Answer/AnswerList.jsx";
import AnswerForm from "../../components/Answer/AnswerForm.jsx";
import "./QuestionDetail.css";

const QuestionDetail = () => {
  const { id } = useParams();

  const dispatch = useDispatch();
  const { currentQuestion, loading, error } = useSelector(
    (state) => state.question,
  );
  const userInfo = useSelector((state) => state.user.userInfo);

  const [summary, setSummary] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    dispatch(fetchQuestionById(id));
    setSummary(null);
    setShowSummary(false);
  }, [id, dispatch]);

  if (loading) {
    return (
      <Container className="qd-loading-container">
        <Spinner />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="qd-loading-container">
        <p>Error loading question: {error}</p>
      </Container>
    );
  }

  if (!currentQuestion) {
    return (
      <Container className="qd-loading-container">
        <p>Question not found.</p>
      </Container>
    );
  }

  const answers = currentQuestion.answers || [];
  const canSummarize = userInfo && answers.length >= 3;

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const answerTexts = answers.map((a) => a.answerText);
      const result = await summarizeAnswers(
        { questionText: currentQuestion.title, answers: answerTexts },
        userInfo.token,
      );
      setSummary(result.summary);
      setShowSummary(true);
    } catch (err) {
      console.error("Error summarizing answers:", err);
      alert("Failed to summarize answers. Please try again.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleDismissSummary = () => {
    setShowSummary(false);
  };

  return (
    <Container className="qd-container">
      <Row className="justify-content-center">
        <Col xs={12} lg={10} xl={8}>
          <QuestionContent question={currentQuestion} />

          {canSummarize && !showSummary && (
            <div className="mb-3 text-end">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleSummarize}
                disabled={isSummarizing}
              >
                {isSummarizing ? (
                  <>
                    <Spinner as="span" size="sm" className="me-2" />
                    Summarizing...
                  </>
                ) : (
                  <>
                    <FaRobot className="me-2" />
                    Summarize Answers
                  </>
                )}
              </Button>
            </div>
          )}

          {showSummary && summary && (
            <Alert
              variant="secondary"
              className="mb-3"
              onClose={handleDismissSummary}
              dismissible
            >
              <Alert.Heading as="h6" className="mb-1">
                AI Summary
              </Alert.Heading>
              <p className="mb-0">{summary}</p>
            </Alert>
          )}

          <AnswerList answers={currentQuestion.answers} />

          <AnswerForm questionId={id} />
        </Col>
      </Row>
    </Container>
  );
};

export default QuestionDetail;
