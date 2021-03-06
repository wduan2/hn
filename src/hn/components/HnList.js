import bulma from 'bulma/css/bulma.css';
import React from 'react';
import { connect } from 'react-redux';
import infinityScroll$ from '../../common/scrolling';
import { fetchHn } from "../actions/fetchHn";
import { fetchHnIndex } from "../actions/fetchHnIndex";
import Hn from './Hn';
import SortBy from './SortBy';

class HnList extends React.Component {

    /**
     * Height of the top bar.
     */
    TOPBAR_HEIGHT = 50;

    /**
     * Threshold distance to the list bottom that trigger infinite scroller loading.
     */
    LOADING_THRESHOLD_FACTOR = .5;

    constructor(props) {
        super(props);

        this.props.fetchHnIndex();
    }

    componentWillUnmount() {
        infinityScroll$.unsubscribe();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const prevHnIndex = prevProps.hnIndex;
        const { hnIndex, hnList, hnFetchingStat, fetchHn } = this.props;

        if (hnIndex.inProgress || hnList.inProgress) {
            return;
        }

        // fetching news while index is updated
        if (hnIndex.newsIds.length === 0 || hnIndex.newsIds[0] !== prevHnIndex.newsIds[0]) {
            fetchHn(hnIndex.newsIds, hnFetchingStat.offset);
        }
    }

    componentDidMount() {
        infinityScroll$.subscribe(
            (position) => {
                const { hnIndex, hnList, hnFetchingStat, fetchHn, fetchHnIndex } = this.props;

                // use innerHeight for mobile browser
                const viewHeight = window.innerHeight || position.clientHeight;

                if (!hnList.inProgress && position.scrollTop + viewHeight >= (position.scrollHeight * this.LOADING_THRESHOLD_FACTOR)) {
                    // scroll to bottom
                    fetchHn(hnIndex.newsIds, hnFetchingStat.offset);
                } else if (!hnIndex.inProgress && position.scrollTop <= 0) {
                    // scroll to top
                    fetchHnIndex();
                }
            },
            (err) => console.log(err))
    }

    render() {
        const { hnIndex, hnList, hnFetchingStat } = this.props;
        const newsCount = hnIndex.newsIds && hnList.news ? `${hnIndex.newsIds.length}/${hnList.news.length}` : '';
        const progressMax = hnFetchingStat.total || 0;
        const progressDone = hnFetchingStat.total - hnFetchingStat.remaining || 0;

        return (
            <div>
                <div style={{ position: 'fixed', width: '100%', height: `${this.TOPBAR_HEIGHT}px`, top: '0' }} className={[bulma['navbar'], bulma['is-warning']].join(' ')}>
                    <progress style={{ position: 'fixed', width: '100%', height: '3px', display: hnFetchingStat.remaining ? 'inline-block' : 'none' }} className={[bulma['progress'], bulma['is-small']].join(' ')} max={progressMax} value={progressDone}></progress>
                    <div style={{ margin: '0px 15px', textAlign: 'center', alignItems: 'center' }} className={bulma['navbar-brand']}>
                        {newsCount}
                        <SortBy />
                    </div>
                </div>
                <div style={{ marginTop: `${this.TOPBAR_HEIGHT * 1.3}px` }}>
                    {hnList.news.map((hn) => <Hn key={hn.id} {...hn}></Hn>)}
                </div>
            </div>
        )
    }
}

const mapStateToProps = ({ hnIndex, hnList, hnFetchingStat }) => ({ hnIndex, hnList, hnFetchingStat });

const mapDispatchToProps = (dispatch) => ({
    fetchHnIndex: () => dispatch(fetchHnIndex()),
    fetchHn: (newsIds, offset) => dispatch(fetchHn(newsIds, offset))
});

export default connect(mapStateToProps, mapDispatchToProps)(HnList);
